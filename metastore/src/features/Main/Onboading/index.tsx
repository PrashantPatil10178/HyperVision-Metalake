"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { ProviderCard } from "./Provider-card";
import { ConnectionProgress } from "./connection-progress";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import useUser from "@/hooks/useUser";

interface S3Connection {
  provider: string;
  accessKey: string;
  secretKey: string;
  bucketName?: string;
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<S3Connection>({
    provider: "",
    accessKey: "",
    secretKey: "",
    bucketName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { data: Userdata } = useUser();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof S3Connection, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleProviderSelect = (provider: string) => {
    setFormData((prev) => ({ ...prev, provider }));
    setStep(2);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError(null);
    setIsLoading(false); // Reset loading state
    setIsConnected(false); // Reset connected state
  };

  const handleNext = () => {
    if (step === 2) {
      if (!formData.accessKey || !formData.secretKey) {
        setError("Please fill in all required fields.");
        return;
      }
    }
    setStep((prev) => prev + 1);
    setError(null);
    setIsLoading(false); // Reset loading state
    setIsConnected(false); // Reset connected state
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || !formData.accessKey || !formData.secretKey) {
      setError("Please fill in all required fields.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      setIsConnected(true);

      setTimeout(() => {
        console.log("Redirecting to dashboard...");
      }, 1500);
    } catch (err) {
      setError("Failed to connect S3 bucket. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    // Simulate connection process for better UX
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      toast.success("Redirecting to Dashboard!");

      setTimeout(() => {
        navigate({
          to: "/Dashboard",
        });
        console.log("Redirecting to dashboard with demo data...");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-[oklch(0.9_0.03_240)] p-4">
      <div className="absolute inset-0 -z-10 bg-[oklch(0.98_0.01_240)] dark:bg-[oklch(0.15_0.02_240)]">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-[oklch(0.85_0.1_280)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-[oklch(0.85_0.1_200)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[oklch(0.85_0.1_140)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-[oklch(0.85_0.1_30)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-border/50 overflow-hidden bg-background/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4 relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-[oklch(0.6_0.2_240)] bg-clip-text text-transparent">
              Welcome to Metastore Viewer
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Connect your S3 bucket to get started
            </p>

            <div className="flex justify-center mt-6 gap-2">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "h-2 rounded-full",
                    i === step
                      ? "bg-primary"
                      : i < step
                        ? "bg-primary/70"
                        : "bg-muted"
                  )}
                  initial={{ width: 24, opacity: 0.5 }}
                  animate={{
                    width: i === step ? 40 : 24,
                    opacity: i === step ? 1 : i < step ? 0.7 : 0.3,
                    backgroundColor:
                      i === step
                        ? "hsl(220, 100%, 50%)" // Blue
                        : i < step
                          ? "hsl(220, 100%, 60%, 0.9)"
                          : "hsl(220, 15%, 75%)",
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="px-6 py-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium text-center mb-4">
                      Select your cloud provider
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <ProviderCard
                        id="aws"
                        name="Amazon Web Services"
                        logo="/placeholder.svg?height=40&width=40"
                        selected={formData.provider === "aws"}
                        onClick={() => handleProviderSelect("aws")}
                      />
                      <ProviderCard
                        id="google"
                        name="Google Cloud Storage"
                        logo="/placeholder.svg?height=40&width=40"
                        selected={formData.provider === "google"}
                        onClick={() => handleProviderSelect("google")}
                      />
                      <ProviderCard
                        id="other"
                        name="Other S3-Compatible"
                        logo="/placeholder.svg?height=40&width=40"
                        selected={formData.provider === "other"}
                        onClick={() => handleProviderSelect("other")}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-medium mb-4">
                      Enter your credentials
                    </h3>

                    {/* S3 Access Key */}
                    <div className="space-y-2">
                      <Label htmlFor="accessKey">S3 Access Key</Label>
                      <Input
                        id="accessKey"
                        type="text"
                        placeholder="AKIA..."
                        value={formData.accessKey}
                        onChange={(e) =>
                          handleInputChange("accessKey", e.target.value)
                        }
                        className="bg-background"
                        required
                      />
                    </div>

                    {/* S3 Secret Key */}
                    <div className="space-y-2">
                      <Label htmlFor="secretKey">S3 Secret Key</Label>
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="••••••••"
                        value={formData.secretKey}
                        onChange={(e) =>
                          handleInputChange("secretKey", e.target.value)
                        }
                        className="bg-background"
                        required
                      />
                    </div>
                    <h3 className="text-lg font-medium mb-4">
                      Additional settings
                    </h3>

                    {/* Optional Bucket Name */}
                    <div className="space-y-2">
                      <Label htmlFor="bucketName">
                        Bucket Name{" "}
                        <span className="text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="bucketName"
                        type="text"
                        placeholder="my-bucket"
                        value={formData.bucketName}
                        onChange={(e) =>
                          handleInputChange("bucketName", e.target.value)
                        }
                        className="bg-background"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to list all available buckets
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Connection Progress - Only shown when isLoading is true */}
                    {isLoading && (
                      <ConnectionProgress
                        provider={isDemoMode ? "demo" : formData.provider}
                        isConnected={isConnected}
                        newID={Userdata?.id!}
                        accessKey={
                          isDemoMode ? "demo-access-key" : formData.accessKey
                        }
                        secretKey={
                          isDemoMode ? "demo-secret-key" : formData.secretKey
                        }
                        bucketName={
                          isDemoMode ? "demo-bucket" : formData.bucketName || ""
                        }
                      />
                    )}

                    {isDemoMode && isConnected && (
                      <div className="text-center py-4">
                        <Check className="h-8 w-8 text-[oklch(0.5_0.15_140)] mx-auto mb-2" />
                        <h3 className="text-lg font-medium">
                          Demo Mode Activated
                        </h3>
                        <p className="text-muted-foreground">
                          Redirecting to dashboard with sample data...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-destructive text-sm text-center mt-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="flex justify-between px-6 py-4 border-t">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="gap-1 hover:bg-background/80"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDemoMode}
                  disabled={isLoading || isConnected || isDemoMode}
                  className="gap-1 hover:bg-background/80"
                >
                  See Dashboard with Demo Data
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="gap-1 hover:bg-primary/90"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || isConnected}
                  className={cn(
                    "gap-2 min-w-[120px] hover:bg-[oklch(0.45_0.15_140)]",
                    isConnected &&
                      "bg-[oklch(0.5_0.15_140)] hover:bg-[oklch(0.45_0.15_140)]"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isDemoMode ? "Loading Demo..." : "Connecting..."}
                    </>
                  ) : isConnected ? (
                    <>
                      <Check className="h-4 w-4" />
                      {isDemoMode ? "Demo Ready!" : "Connected!"}
                    </>
                  ) : (
                    "Connect"
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
