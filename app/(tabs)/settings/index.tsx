import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Modal,
  Share,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { PageLayout, GlassCard } from '@/components/layouts';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/context/auth-provider';
import { useCurrency } from '@/context/currency-provider';
import { useTheme } from '@/context/theme-provider';
import { useColors } from '@/lib/hooks/use-colors';
import { APP_URLS } from '@/lib/config/urls';
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
  Gift,
  Coins,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SettingsItemProps {
  icon: React.ElementType;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
  colors: ReturnType<typeof useColors>;
  isDark: boolean;
}

function SettingsItem({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
  colors,
  isDark,
}: SettingsItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-4 px-1">
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: danger
            ? 'rgba(239, 68, 68, 0.2)'
            : isDark
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)',
        }}
      >
        <Icon size={18} color={danger ? '#EF4444' : colors.textSecondary} />
      </View>
      <Text className="flex-1 text-base" style={{ color: danger ? '#EF4444' : colors.text }}>
        {label}
      </Text>
      {showChevron && <ChevronRight size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

function SettingsGroup({
  children,
  title,
  colors,
}: {
  children: React.ReactNode;
  title?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View className="mb-4">
      {title && (
        <Text
          className="text-xs uppercase tracking-wider px-5 mb-2"
          style={{ color: colors.textMuted }}
        >
          {title}
        </Text>
      )}
      <GlassCard>
        <View className="-my-1">{children}</View>
      </GlassCard>
    </View>
  );
}

const DELETE_REASONS = [
  'No longer need the app',
  'Found a better alternative',
  'Too difficult to use',
  'Privacy concerns',
  'Other',
];

export default function SettingsScreen() {
  const router = useRouter();
  const { deleteAccount, signOut } = useAuth();
  const { currency } = useCurrency();
  const { theme, setTheme, isDark } = useTheme();
  const colors = useColors();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've been using Debt Free to crush my debt and it's actually working! If you're looking for a simple way to track your payments and stay motivated, check it out:\n\n${APP_URLS.appStore}`,
      });
    } catch {
      // User cancelled or error
    }
  };

  const handleRateApp = async () => {
    const isAvailable = await StoreReview.isAvailableAsync();
    console.log('--clicked');
    if (isAvailable) {
      await StoreReview.requestReview();
    } else {
      // Fallback to App Store URL if in-app review not available
      Linking.openURL(APP_URLS.appStore);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason) return;

    setIsDeleting(true);
    try {
      await deleteAccount(deleteReason, additionalComments);
      setShowDeleteModal(false);
    } catch {
      // Error is handled in auth provider
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteAlert = () => {
    setDeleteReason('');
    setAdditionalComments('');
    setShowDeleteModal(true);
  };

  return (
    <PageLayout title="Settings">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      >
        {/* Share with Friends Banner */}
        <Pressable onPress={handleShare} className="mx-4 mb-4">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={['#064e3b', '#065f46', '#047857']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View className="absolute inset-0 rounded-2xl border border-emerald-400/20" />
            <View className="p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center mr-4">
                <Gift size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Share with Friends</Text>
                <Text className="text-emerald-100/80 text-sm">
                  Help a friend start their debt-free journey
                </Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </Pressable>

        {/* Account Section */}
        <SettingsGroup title="Account" colors={colors}>
          <SettingsItem
            icon={User}
            label="Profile"
            onPress={() => router.push('/profile')}
            colors={colors}
            isDark={isDark}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Bell}
            label="Notifications"
            onPress={() => router.push('/notifications')}
            colors={colors}
            isDark={isDark}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <Pressable
            onPress={() => router.push('/currency')}
            className="flex-row items-center py-4 px-1"
          >
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <Coins size={18} color={colors.textSecondary} />
            </View>
            <Text className="flex-1 text-base" style={{ color: colors.text }}>
              Currency
            </Text>
            <Text className="mr-2" style={{ color: colors.textSecondary }}>
              {currency.flag} {currency.code}
            </Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </Pressable>
        </SettingsGroup>

        {/* Appearance Section */}
        <SettingsGroup title="Appearance" colors={colors}>
          <Pressable onPress={() => setTheme('system')} className="flex-row items-center py-4 px-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor:
                  theme === 'system'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.05)',
              }}
            >
              <Smartphone size={18} color={theme === 'system' ? '#10B981' : colors.textSecondary} />
            </View>
            <Text
              className="flex-1 text-base"
              style={{ color: theme === 'system' ? '#10B981' : colors.text }}
            >
              System
            </Text>
            {theme === 'system' && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
          </Pressable>
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <Pressable onPress={() => setTheme('light')} className="flex-row items-center py-4 px-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor:
                  theme === 'light'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.05)',
              }}
            >
              <Sun size={18} color={theme === 'light' ? '#10B981' : colors.textSecondary} />
            </View>
            <Text
              className="flex-1 text-base"
              style={{ color: theme === 'light' ? '#10B981' : colors.text }}
            >
              Light
            </Text>
            {theme === 'light' && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
          </Pressable>
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <Pressable onPress={() => setTheme('dark')} className="flex-row items-center py-4 px-1">
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{
                backgroundColor:
                  theme === 'dark'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.05)',
              }}
            >
              <Moon size={18} color={theme === 'dark' ? '#10B981' : colors.textSecondary} />
            </View>
            <Text
              className="flex-1 text-base"
              style={{ color: theme === 'dark' ? '#10B981' : colors.text }}
            >
              Dark
            </Text>
            {theme === 'dark' && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
          </Pressable>
        </SettingsGroup>

        {/* Support Section */}
        <SettingsGroup title="Support" colors={colors}>
          <SettingsItem
            icon={MessageCircle}
            label="Give Feedback"
            onPress={() => router.push('/feedback')}
            colors={colors}
            isDark={isDark}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Star}
            label="Rate the App"
            onPress={handleRateApp}
            colors={colors}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* Legal Section */}
        <SettingsGroup title="Legal" colors={colors}>
          <SettingsItem
            icon={FileText}
            label="Terms of Service"
            onPress={() => Linking.openURL(APP_URLS.terms)}
            colors={colors}
            isDark={isDark}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => Linking.openURL(APP_URLS.privacy)}
            colors={colors}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* Account Actions */}
        <SettingsGroup colors={colors}>
          <SettingsItem
            icon={LogOut}
            label="Log Out"
            onPress={() => setShowLogoutModal(true)}
            showChevron={false}
            colors={colors}
            isDark={isDark}
          />
          <View className="h-px mx-1" style={{ backgroundColor: colors.borderLight }} />
          <SettingsItem
            icon={Trash2}
            label="Delete Account"
            onPress={showDeleteAlert}
            showChevron={false}
            danger
            colors={colors}
            isDark={isDark}
          />
        </SettingsGroup>

        {/* App Version */}
        <View className="items-center mt-4">
          <Text className="text-sm" style={{ color: colors.textMuted }}>
            Debt Free v1.0.3
          </Text>
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

      {/* Delete Account Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)' }}
          onPress={() => !isDeleting && setShowDeleteModal(false)}
        >
          <Pressable
            className="w-full rounded-3xl overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            <BlurView
              intensity={isDark ? 60 : 80}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.7)',
                }}
              />
            </BlurView>
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />
            <View className="p-6">
              <Text
                className="text-xl font-semibold text-center mb-2"
                style={{ color: colors.text }}
              >
                Delete Account
              </Text>
              <Text className="text-center mb-4" style={{ color: colors.textSecondary }}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>

              <Text className="font-medium mb-2" style={{ color: colors.text }}>
                Please tell us why you're leaving:
              </Text>
              {DELETE_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  onPress={() => setDeleteReason(reason)}
                  className="flex-row items-center py-3 px-3 rounded-lg mb-2"
                  style={{
                    backgroundColor:
                      deleteReason === reason
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isDark
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <View
                    className="w-5 h-5 rounded-full border-2 mr-3 items-center justify-center"
                    style={{ borderColor: deleteReason === reason ? '#EF4444' : colors.textMuted }}
                  >
                    {deleteReason === reason && (
                      <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </View>
                  <Text style={{ color: colors.text }}>{reason}</Text>
                </Pressable>
              ))}

              <TextInput
                placeholder="Additional comments (optional)"
                placeholderTextColor={colors.inputPlaceholder}
                value={additionalComments}
                onChangeText={setAdditionalComments}
                multiline
                numberOfLines={3}
                keyboardAppearance={isDark ? 'dark' : 'light'}
                className="rounded-lg p-3 mt-2 mb-4"
                style={{
                  textAlignVertical: 'top',
                  minHeight: 80,
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                }}
              />

              {isDeleting && (
                <View className="flex-row items-center justify-center mb-4">
                  <ActivityIndicator size="small" color="#EF4444" />
                  <Text className="ml-2" style={{ color: colors.textSecondary }}>
                    Deleting your account...
                  </Text>
                </View>
              )}

              <View className="gap-3">
                <Pressable
                  onPress={handleDeleteAccount}
                  disabled={!deleteReason || isDeleting}
                  className="py-4 rounded-2xl"
                  style={{
                    backgroundColor:
                      !deleteReason || isDeleting
                        ? 'rgba(239, 68, 68, 0.4)'
                        : 'rgba(239, 68, 68, 0.8)',
                  }}
                >
                  <Text className="text-white text-center font-semibold">
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="py-4 rounded-2xl"
                  style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <Text className="text-center font-medium" style={{ color: colors.text }}>
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </PageLayout>
  );
}
