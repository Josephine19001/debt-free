import React, { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from 'react';
import { StyleSheet, ViewStyle, Keyboard, Platform } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetTextInput,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBar } from '@/context/tab-bar-provider';

export interface GlassBottomSheetRef {
  expand: () => void;
  close: () => void;
  snapToIndex: (index: number) => void;
}

interface GlassBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  onChange?: (index: number) => void;
  enablePanDownToClose?: boolean;
  hideTabBar?: boolean;
  contentStyle?: ViewStyle;
  enableDynamicSizing?: boolean;
}

export const GlassBottomSheet = forwardRef<GlassBottomSheetRef, GlassBottomSheetProps>(
  (
    {
      children,
      snapPoints = ['40%'],
      onClose,
      onChange,
      enablePanDownToClose = true,
      hideTabBar: shouldHideTabBar = true,
      contentStyle,
      enableDynamicSizing = false,
    },
    ref
  ) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { hideTabBar, showTabBar } = useTabBar();
    const isExpanded = useRef(false);

    // Auto-expand when keyboard shows (if there are multiple snap points)
    useEffect(() => {
      const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const showSubscription = Keyboard.addListener(keyboardShowEvent, () => {
        if (snapPoints.length > 1 && !isExpanded.current) {
          bottomSheetRef.current?.snapToIndex(snapPoints.length - 1);
          isExpanded.current = true;
        }
      });

      const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
        isExpanded.current = false;
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, [snapPoints]);

    useImperativeHandle(ref, () => ({
      expand: () => {
        if (shouldHideTabBar) hideTabBar();
        bottomSheetRef.current?.expand();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
      snapToIndex: (index: number) => {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === -1) {
          if (shouldHideTabBar) showTabBar();
          onClose?.();
        }
        onChange?.(index);
      },
      [showTabBar, shouldHideTabBar, onClose, onChange]
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        style={styles.sheet}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView
          style={[styles.sheetContent, { paddingBottom: insets.bottom }, contentStyle]}
        >
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

GlassBottomSheet.displayName = 'GlassBottomSheet';

export { BottomSheetTextInput, BottomSheetScrollView };

const styles = StyleSheet.create({
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sheetBackground: {
    backgroundColor: '#151515',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 40,
  },
  sheetContent: {
    flex: 1,
  },
});
