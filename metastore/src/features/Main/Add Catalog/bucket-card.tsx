"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Database } from "lucide-react";

interface BucketCardProps {
  id: string;
  name: string;
  format: string;
  selected: boolean;
  onClick: () => void;
}

export function BucketCard({
  id,
  name,
  format,
  selected,
  onClick,
}: BucketCardProps) {
  // Map format to colors
  const formatDetails = {
    hudi: {
      color: "from-[oklch(0.8_0.12_30)] to-[oklch(0.7_0.15_30)]",
      borderColor: "border-[oklch(0.7_0.15_30)]",
      activeColor: "bg-[oklch(0.85_0.08_30)]",
    },
    delta: {
      color: "from-[oklch(0.7_0.1_240)] to-[oklch(0.6_0.15_240)]",
      borderColor: "border-[oklch(0.6_0.15_240)]",
      activeColor: "bg-[oklch(0.8_0.05_240)]",
    },
    iceberg: {
      color: "from-[oklch(0.7_0.15_300)] to-[oklch(0.6_0.2_300)]",
      borderColor: "border-[oklch(0.6_0.2_300)]",
      activeColor: "bg-[oklch(0.8_0.1_300)]",
    },
  };

  const details =
    formatDetails[format as keyof typeof formatDetails] || formatDetails.hudi;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center p-4 rounded-lg border cursor-pointer transition-all",
        "hover:shadow-lg hover:border-primary/50",
        selected
          ? cn(
              "border-primary shadow-md",
              details.activeColor,
              "ring-2 ring-primary/20"
            )
          : "border-border/50 bg-card/60 backdrop-blur-sm hover:bg-card/80"
      )}
    >
      <motion.div
        className={cn(
          "w-12 h-12 rounded-md flex items-center justify-center mr-4 bg-gradient-to-br",
          details.color
        )}
        whileHover={{
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 0.5 },
        }}
        animate={
          selected
            ? {
                scale: [1, 1.1, 1],
                transition: { duration: 0.5, repeat: 0 },
              }
            : {}
        }
      >
        <Database className="h-6 w-6 text-white" />
      </motion.div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">
          {format.charAt(0).toUpperCase() + format.slice(1)} Format
        </p>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md"
          >
            <Check className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
