import { apiClient } from '../client';
import { supabase } from '@/lib/supabase/client';
import { decode } from 'base64-arraybuffer';
import type {
  Account,
  CreateAccountData,
  UpdateAccountData,
  Subscription,
  VerifyReceiptData,
} from '../types';
import { AVATAR_BUCKET } from '@/constants/images';

export const accountsService = {
  async createAccount(data: CreateAccountData): Promise<Account> {
    return apiClient.post<Account>('/accounts', data);
  },

  async getAccount(): Promise<Account> {
    return apiClient.get<Account>('/accounts/me');
  },

  async updateAccount(data: UpdateAccountData): Promise<Account> {
    return apiClient.put<Account>('/accounts/me', data);
  },

  async deleteAccount(): Promise<void> {
    return apiClient.delete<void>('/accounts/me');
  },

  async uploadAvatar(
    imageUri: string,
    base64: string
  ): Promise<{ avatar: string; message: string }> {
    try {
      const account = await this.getAccount();

      const ext = imageUri.split('.').pop() || 'jpg';
      const filename = `${account.id}.${ext}`;
      const path = filename;

      const binary = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, binary, {
          contentType: `image/${ext}`,
          upsert: true,
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error('Failed to upload to storage');
      }

      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

      const avatarUrl = urlData.publicUrl;

      await this.updateAccount({ avatar: avatarUrl });

      return {
        avatar: avatarUrl,
        message: 'Avatar uploaded successfully',
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },

  async deleteAvatar(): Promise<{ success: boolean }> {
    try {
      const account = await this.getAccount();

      if (account.avatar) {
        // Extract filename from URL for deletion
        const url = new URL(account.avatar);
        const pathSegments = url.pathname.split('/');
        const filename = pathSegments[pathSegments.length - 1];

        if (filename) {
          await supabase.storage.from(AVATAR_BUCKET).remove([filename]);
        }
      }

      // Update account to remove avatar
      await this.updateAccount({ avatar: undefined });

      return { success: true };
    } catch (error) {
      console.error('Avatar delete error:', error);
      throw error;
    }
  },

  // Subscription Management
  async getSubscription(): Promise<Subscription> {
    return apiClient.get<Subscription>('/accounts/subscription');
  },

  async updateSubscription(data: Partial<Subscription>): Promise<Subscription> {
    return apiClient.put<Subscription>('/accounts/subscription', data);
  },

  async verifyReceipt(data: VerifyReceiptData): Promise<Subscription> {
    return apiClient.post<Subscription>('/accounts/subscription/verify', data);
  },
};
