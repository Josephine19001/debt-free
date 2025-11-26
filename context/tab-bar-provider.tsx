import React, { createContext, useContext, useState, useCallback } from 'react';

interface TabBarContextType {
  isTabBarVisible: boolean;
  hideTabBar: () => void;
  showTabBar: () => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const hideTabBar = useCallback(() => setIsTabBarVisible(false), []);
  const showTabBar = useCallback(() => setIsTabBarVisible(true), []);

  return (
    <TabBarContext.Provider value={{ isTabBarVisible, hideTabBar, showTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
}
