"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-card px-4 py-3 shadow-lg">
            <span className="text-sm font-medium text-brand-text">
              {selectedCount} selected
            </span>

            <div className="h-4 w-px bg-brand-border" />

            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Selection
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
