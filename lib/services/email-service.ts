import { supabase } from '@/lib/supabase/client';

interface SendOTPEmailParams {
  email: string;
  otpCode: string;
}

interface SendOTPResponse {
  success: boolean;
  error?: string;
}

export const emailService = {
  /**
   * Sends an OTP email using Resend via Supabase Edge Function
   */
  sendOTPEmail: async ({ email, otpCode }: SendOTPEmailParams): Promise<SendOTPResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('sent-otp-email', {
        body: {
          email,
          otpCode,
        },
      });

      if (error) {
        console.error('Error sending OTP email:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error sending OTP email:', error);
      return { success: false, error: 'Failed to send email' };
    }
  },

  /**
   * Generates a 6-digit OTP code
   */
  generateOTP: (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
};
