"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const containerVariants = {
  hidden: {},
  show: (delay: number) => ({
    transition: {
      staggerChildren: delay,
    },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

export function StaggeredList({
  children,
  className,
  delay = 0.05,
}: StaggeredListProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      custom={delay}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return <motion.div variants={itemVariants}>{child}</motion.div>;
      })}
    </motion.div>
  );
}
