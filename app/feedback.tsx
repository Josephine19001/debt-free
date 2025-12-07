import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { FormPage, FormField, SaveButton } from '@/components/ui/form-page';
import { supabase } from '@/lib/supabase/client';
import { useColors } from '@/lib/hooks/use-colors';

export default function FeedbackScreen() {
  const router = useRouter();
  const colors = useColors();
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to submit feedback');
        return;
      }

      const { error } = await supabase
        .from('feedback')
        .insert({
          account_id: user.id,
          feedback: feedback.trim(),
        });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      router.back();
    } catch (error) {
      toast.error('Failed to send feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormPage
      title="Give Feedback"
      rightAction={
        <SaveButton
          onPress={handleSubmit}
          disabled={!feedback.trim()}
          loading={isSubmitting}
          label="Send"
        />
      }
    >
      <Text className="text-base -mt-2 mb-2" style={{ color: colors.textSecondary }}>
        We'd love to hear your thoughts on how we can improve.
      </Text>

      <FormField
        label="Your Feedback"
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Share your feedback..."
        multiline
        numberOfLines={4}
      />
    </FormPage>
  );
}
