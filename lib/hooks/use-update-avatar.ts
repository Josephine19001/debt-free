import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import { supabase } from '@/lib/supabase/client';
import { AVATAR_BUCKET } from '@/constants/images';
import { queryKeys } from './query-keys';
import { handleError } from './utils';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export function useUpdateAccountAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileUri }: { fileUri: string }) => {
      const { uri: jpegUri } = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64 = await FileSystem.readAsStringAsync(jpegUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!base64) throw new Error('Failed to convert image to base64');

      const fileName = jpegUri.split('/').pop()!;
      const { data: upload, error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(fileName, base64, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(upload.path);
      const publicUrl = data.publicUrl;

      const { error: rpcErr } = await supabase.rpc('update_account_profile', {
        p_avatar: publicUrl,
      });
      if (rpcErr) throw rpcErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts.detail() });
    },
    onError: (err: any) => handleError(err, 'Failed to update avatar'),
  });
}
