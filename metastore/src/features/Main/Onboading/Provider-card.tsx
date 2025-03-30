"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, DatabaseZapIcon } from "lucide-react";
import aws from "@/assets/aws.png";
import gcp from "@/assets/gcp.png";
import S3 from "@/assets/S3.png";

interface ProviderCardProps {
  id: string;
  name: string;
  logo: string;
  selected: boolean;
  onClick: () => void;
}

export function ProviderCard({
  id,
  name,
  selected,
  onClick,
}: ProviderCardProps) {
  // Map provider IDs to actual logos and colors
  const providerDetails = {
    aws: {
      logo: aws, // Replace with actual AWS logo
      color: "from-[oklch(0.8_0.12_30)] to-[oklch(0.7_0.15_30)]",
      borderColor: "border-[oklch(0.7_0.15_30)]",
      activeColor: "bg-[oklch(0.85_0.08_30)]",
    },
    google: {
      logo: gcp, // Replace with actual Google Cloud logo
      color: "from-[oklch(0.7_0.1_240)] to-[oklch(0.6_0.15_240)]",
      borderColor: "border-[oklch(0.6_0.15_240)]",
      activeColor: "bg-[oklch(0.8_0.05_240)]",
    },
    other: {
      logo: S3,
      color: "from-[oklch(0.7_0.15_300)] to-[oklch(0.6_0.2_300)]",
      borderColor: "border-[oklch(0.6_0.2_300)]",
      activeColor: "bg-[oklch(0.8_0.1_300)]",
    },
  };

  const details = providerDetails[id as keyof typeof providerDetails];

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
        {id === "other" ? (
          <DatabaseZapIcon height={30} width={30} />
        ) : (
          <img
            src={details.logo}
            alt={name}
            width={35}
            height={35}
            className="object-contain"
          />
        )}
      </motion.div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">
          {id === "aws" && "S3 Storage"}
          {id === "google" && "GCS Buckets"}
          {id === "other" && "Compatible Storage"}
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
