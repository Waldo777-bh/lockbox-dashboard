"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "lockbox-sidebar-collapsed";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const set = useCallback((value: boolean) => {
    setCollapsed(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return { collapsed: mounted ? collapsed : false, toggle, setCollapsed: set, mounted };
}
