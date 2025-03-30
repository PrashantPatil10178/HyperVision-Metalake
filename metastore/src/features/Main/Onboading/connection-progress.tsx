"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { functions, databases } from "@/lib/appwrite";
import { useNavigate } from "@tanstack/react-router";
import useUser from "@/hooks/useUser";
import { ID } from "appwrite";
import { encryptData } from "@/utils/encryption";
import { toast } from "sonner";
import api from "@/services/AxiosInterceptor";

interface ConnectionProgressProps {
  provider: string;
  isConnected: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  newID: string;
}

export function ConnectionProgress({
  provider,
  isConnected,
  accessKey,
  secretKey,
  bucketName,
  newID,
}: ConnectionProgressProps) {
  console.log("newID", newID);
  const [steps, setSteps] = useState([
    { id: 1, label: "Validating credentials", completed: false, current: true },
    {
      id: 2,
      label: "Establishing connection",
      completed: false,
      current: false,
    },
    { id: 3, label: "Testing permissions", completed: false, current: false },
    { id: 4, label: "Finalizing setup", completed: false, current: false },
  ]);

  const [buckets, setBuckets] = useState<string[]>([]);
  const router = useNavigate();
  const { data: Userdata, isLoading, isError } = useUser();
  const navigate = useNavigate();

  // Refs to track if toasts have been shown
  const successToastShown = useRef(false);
  const infoToastShown = useRef(false);
  const timeoutSet = useRef(false);
  const documentSavedRef = useRef(false);

  useEffect(() => {
    if (isConnected || documentSavedRef.current || isLoading) return;
    console.log("Userdata", Userdata);
    const validateCredentials = async () => {
      try {
        // Start the first step immediately
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === 1 ? { ...step, current: true } : step
          )
        );

        // Simulate delay for the first step
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark the first step as completed and move to the next step
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === 1
              ? { ...step, completed: true, current: false }
              : step.id === 2
                ? { ...step, current: true }
                : step
          )
        );

        // Simulate delay for the second step
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark the second step as completed and move to the next step
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === 2
              ? { ...step, completed: true, current: false }
              : step.id === 3
                ? { ...step, current: true }
                : step
          )
        );

        // Simulate delay for the third step
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark the third step as completed and move to the next step
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === 3
              ? { ...step, completed: true, current: false }
              : step.id === 4
                ? { ...step, current: true }
                : step
          )
        );

        // Simulate delay for the fourth step
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark the fourth step as completed
        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            step.id === 4 ? { ...step, completed: true, current: false } : step
          )
        );

        // Call the Appwrite Cloud Function to validate AWS S3 credentials
        const response = await functions.createExecution(
          "67cc87d4003ad1848877", // Function ID
          JSON.stringify({ accessKey, secretKey, bucketName }),
          false
        );

        console.log(response.responseBody);
        const result = JSON.parse(response.responseBody);

        if (result.success) {
          if (!successToastShown.current) {
            toast.success("Successfully Connected To The S3");
            successToastShown.current = true;
          }

          const bucketNames = result.response.Buckets.map(
            (bucket: { Name: string }) => bucket.Name
          );

          setBuckets(bucketNames);
          const data = {
            provider,
            accessKey,
            secretKey,
            bucketName,
          };

          const encryptedData = encryptData(data);
          console.log(encryptedData);

          if (Userdata && !documentSavedRef.current) {
            documentSavedRef.current = true;
            try {
              const response = await api.post("users/credentials", {
                userId: newID,
                provider: provider,
                accessKey: accessKey,
                secretKey: secretKey,
              });
              const data = await api.post("users/buckets", {
                name: bucketName,
                provider: provider,
                format: "iceburg",
              });
              console.log(response);
            } catch (error) {
              console.error("Error saving credentials:", error);
              toast.error("Failed to save credentials");
              return;
            }
          }

          if (!infoToastShown.current && !timeoutSet.current) {
            timeoutSet.current = true;
            setTimeout(() => {
              toast.info("Redirecting to Dashboard....");
              infoToastShown.current = true;
              navigate({ to: "/Dashboard" });
            }, 3000);
          }
        } else {
          console.error("Validation failed:", result.message);
          toast.error("Failed to validate credentials");
        }
      } catch (err) {
        console.error("Error validating credentials:", err);
        toast.error("Error during connection process");
      }
    };

    validateCredentials();
  }, [
    isConnected,
    accessKey,
    secretKey,
    bucketName,
    router,
    Userdata,
    isLoading,
  ]);

  const getProviderColor = () => {
    switch (provider) {
      case "aws":
        return "text-[oklch(0.7_0.15_30)]";
      case "google":
        return "text-[oklch(0.6_0.15_240)]";
      default:
        return "text-[oklch(0.6_0.2_300)]";
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 pt-4 border-t border-border/50 rounded-md">
        <p className="text-sm text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-6 pt-4 border-t border-border/50 rounded-md">
        <p className="text-sm text-destructive">Error loading user data</p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 pt-4 border-t border-border/50 rounded-md"
    >
      <motion.h4
        className="text-sm font-medium mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Connection Progress
      </motion.h4>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.15 }}
          >
            <motion.div
              className={cn(
                "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center",
                step.completed
                  ? "bg-[oklch(0.95_0.05_140)] text-[oklch(0.5_0.15_140)] shadow-sm shadow-[oklch(0.5_0.15_140)]/20"
                  : step.current
                    ? cn("bg-primary/20", getProviderColor())
                    : "bg-muted"
              )}
              animate={
                step.current
                  ? {
                      scale: [1, 1.1, 1],
                      transition: {
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        duration: 1.5,
                      },
                    }
                  : {}
              }
            >
              {step.completed ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              ) : step.current ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              )}
            </motion.div>
            <div
              className={cn(
                "ml-3 text-sm",
                step.completed
                  ? "text-foreground"
                  : step.current
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
            >
              {step.label}
            </div>

            {/* Progress line */}
            {step.id < steps.length && (
              <motion.div
                className={cn(
                  "ml-3 h-6 w-px bg-border",
                  step.completed ? "bg-[oklch(0.5_0.15_140)]/30" : "bg-border"
                )}
                initial={{ height: 0 }}
                animate={{ height: 24 }}
                transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: `${index * 40 + 30}px`,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Display bucket names after finalizing setup */}
      {steps[3].completed && buckets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <h4 className="text-sm font-medium mb-2">Buckets:</h4>
          <ul className="space-y-2">
            {buckets.map((bucket, index) => (
              <li key={index} className="text-md text-muted-foreground">
                {bucket === bucketName
                  ? `${bucket} is Successfully Connected`
                  : null}
              </li>
            ))}
          </ul>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Redirecting to the dashboard...
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
