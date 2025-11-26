import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  TextInput,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PageLayout, GlassCard } from '@/components/layouts';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { GlassBottomSheet, GlassBottomSheetRef } from '@/components/ui/glass-bottom-sheet';
import {
  User,
  Bell,
  Shield,
  FileText,
  MessageCircle,
  Star,
  LogOut,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

function SettingsItem({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
}: SettingsItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-4 px-1">
      <View
        className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
          danger ? 'bg-red-500/20' : 'bg-white/5'
        }`}
      >
        <Icon size={18} color={danger ? '#EF4444' : '#9CA3AF'} />
      </View>
      <Text
        className={`flex-1 text-base ${danger ? 'text-red-400' : 'text-white'}`}
      >
        {label}
      </Text>
      {showChevron && <ChevronRight size={20} color="#6B7280" />}
    </Pressable>
  );
}

function SettingsGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <View className="mb-4">
      {title && (
        <Text className="text-gray-500 text-xs uppercase tracking-wider px-5 mb-2">
          {title}
        </Text>
      )}
      <GlassCard>
        <View className="-my-1">{children}</View>
      </GlassCard>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const feedbackSheetRef = useRef<GlassBottomSheetRef>(null);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    router.replace('/auth');
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion
    router.replace('/auth');
  };

  const showDeleteAlert = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

  const openFeedbackSheet = useCallback(() => {
    Keyboard.dismiss();
    feedbackSheetRef.current?.expand();
  }, []);

  const closeFeedbackSheet = useCallback(() => {
    Keyboard.dismiss();
    feedbackSheetRef.current?.close();
  }, []);

  const handleFeedbackClose = useCallback(() => {
    setTimeout(() => {
      setFeedback('');
      setSubmitted(false);
    }, 300);
  }, []);

  const handleSubmitFeedback = useCallback(() => {
    if (feedback.trim()) {
      // TODO: Send feedback to backend
      setSubmitted(true);
      setTimeout(() => {
        closeFeedbackSheet();
      }, 1500);
    }
  }, [feedback, closeFeedbackSheet]);

  return (
    <PageLayout title="Settings">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      >
        {/* Account Section */}
        <SettingsGroup title="Account">
          <SettingsItem icon={User} label="Profile" onPress={() => {}} />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem icon={Bell} label="Notifications" onPress={() => {}} />
        </SettingsGroup>

        {/* Support Section */}
        <SettingsGroup title="Support">
          <SettingsItem
            icon={MessageCircle}
            label="Give Feedback"
            onPress={openFeedbackSheet}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem icon={Star} label="Rate the App" onPress={() => {}} />
        </SettingsGroup>

        {/* Legal Section */}
        <SettingsGroup title="Legal">
          <SettingsItem
            icon={FileText}
            label="Terms of Service"
            onPress={() => Linking.openURL('https://www.debt-free.app/terms')}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://www.debt-free.app/privacy')}
          />
        </SettingsGroup>

        {/* Account Actions */}
        <SettingsGroup>
          <SettingsItem
            icon={LogOut}
            label="Log Out"
            onPress={() => setShowLogoutModal(true)}
            showChevron={false}
          />
          <View className="h-px bg-white/10 mx-1" />
          <SettingsItem
            icon={Trash2}
            label="Delete Account"
            onPress={showDeleteAlert}
            showChevron={false}
            danger
          />
        </SettingsGroup>

        {/* App Version */}
        <View className="items-center mt-4">
          <Text className="text-gray-600 text-sm">Debt Free v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
      />

      {/* Feedback Bottom Sheet */}
      <GlassBottomSheet
        ref={feedbackSheetRef}
        snapPoints={['40%']}
        onClose={handleFeedbackClose}
      >
        <View className="flex-1 px-6 pt-2">
          <Text className="text-xl font-semibold text-white mb-2">
            Give Feedback
          </Text>

          {submitted ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-emerald-400 text-lg font-medium">
                Thank you for your feedback!
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-gray-400 mb-4">
                We'd love to hear your thoughts on how we can improve.
              </Text>

              <View style={styles.textInputContainer}>
                <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.textInputGlass} />
                <TextInput
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="Share your feedback..."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  className="text-white text-base p-4 flex-1"
                  style={styles.textInput}
                />
              </View>
            </>
          )}
        </View>

        {!submitted && (
          <View className="px-6 pb-4">
            <Pressable
              onPress={handleSubmitFeedback}
              style={[
                styles.submitButton,
                { opacity: feedback.trim() ? 1 : 0.5 },
              ]}
              disabled={!feedback.trim()}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text className="text-white text-center font-semibold">
                Send Feedback
              </Text>
            </Pressable>
          </View>
        )}
      </GlassBottomSheet>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  textInputContainer: {
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  textInputGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
