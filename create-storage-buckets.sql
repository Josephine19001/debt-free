-- Create only the account-avatars bucket (product-images already exists)
-- Run this SQL script in your Supabase SQL Editor

-- Create account-avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('account-avatars', 'account-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for account avatars only
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'account-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'account-avatars');

CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'account-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'account-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
