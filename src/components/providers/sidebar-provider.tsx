"use client";

import { createContext, useContext } from "react";
import { useSidebar } from "@/hooks/use-sidebar";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar();

  return (
    <SidebarContext.Provider
      value={{
        collapsed: sidebar.collapsed,
        toggle: sidebar.toggle,
        setCollapsed: sidebar.setCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  return useContext(SidebarContext);
}
