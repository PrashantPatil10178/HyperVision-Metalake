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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus } from "lucide-react";
import { ConnectionProgress } from "./connection-progress";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import useUser from "@/hooks/useUser";

interface Credential {
  id: string;
  provider: string;
  accessKey: string;
}

interface Bucket {
  id: string;
  name: string;
  format: string;
}

interface UserData {
  id?: string;
  credentials?: Credential[];
  buckets?: Bucket[];
}

interface S3Connection {
  provider: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  tableFormat: string;
}

interface BucketCardProps {
  id: string;
  name: string;
  format: string;
  selected: boolean;
  onClick: () => void;
}

function BucketCard({ id, name, format, selected, onClick }: BucketCardProps) {
  return (
    <button
      id={id}
      className={cn(
        "flex items-center space-x-3 rounded-md border p-4 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        selected ? "bg-secondary text-secondary-foreground" : "bg-background"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-1 leading-none">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">Format: {format}</p>
      </div>
    </button>
  );
}

export default function AddCatalogScreen() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<"existing" | "new">(
    "existing"
  );
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [newBucketName, setNewBucketName] = useState<string>("");
  const [tableFormat, setTableFormat] = useState<string>("hudi");
  const [formData, setFormData] = useState<S3Connection>({
    provider: "aws",
    accessKey: "",
    secretKey: "",
    bucketName: "",
    tableFormat: "hudi",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: userData } = useUser();
  const navigate = useNavigate();

  // Extract existing accounts and buckets from userData
  const existingAccounts = userData?.credentials || [];
  const existingBuckets = userData?.buckets || [];

  const handleInputChange = (field: keyof S3Connection, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError(null);
    setIsLoading(false);
    setIsConnected(false);
  };

  const handleNext = () => {
    if (step === 1) {
      if (accountType === "existing" && !selectedAccount) {
        setError("Please select an account");
        return;
      }

      // Skip to step 3 if using existing account
      if (accountType === "existing") {
        setStep(2); // Go directly to bucket selection (step 2)
      } else {
        setStep(2); // Go to credentials page for new accounts
      }
    } else if (step === 2) {
      if (accountType === "existing") {
        if (!selectedBucket && !newBucketName) {
          setError("Please select a bucket or enter a new bucket name");
          return;
        }
      } else {
        if (!formData.accessKey || !formData.secretKey) {
          setError("Please fill in all required fields");
          return;
        }
      }

      setStep(3); // Go to format selection
    }

    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountType === "existing") {
      const bucketToUse = selectedBucket || newBucketName;
      if (!bucketToUse || !tableFormat) {
        setError("Please fill in all required fields");
        return;
      }

      // Handle existing account submission
      setIsLoading(true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        toast.success("Catalog added successfully!");
        setTimeout(() => {
          navigate({ to: "/Dashboard" });
        }, 1500);
      } catch (err) {
        setError("Failed to add catalog");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Handle new account submission
      if (
        !formData.accessKey ||
        !formData.secretKey ||
        !formData.bucketName ||
        !formData.tableFormat
      ) {
        setError("Please fill in all required fields");
        return;
      }

      setIsLoading(true);

      try {
        // Simulate connection test
        await new Promise((resolve) => setTimeout(resolve, 3000));
        setIsConnected(true);

        toast.success("Connection successful! Adding catalog...");

        // Simulate adding catalog
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success("Catalog added successfully!");
        setTimeout(() => {
          navigate({ to: "/Dashboard" });
        }, 1500);
      } catch (err) {
        setError("Failed to connect to S3 bucket");
      } finally {
        setIsLoading(false);
      }
    }
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
              Add Catalog
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Connect to a data source to create a new catalog
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
                      Choose Account Type
                    </h3>

                    <Tabs
                      defaultValue="existing"
                      className="w-full"
                      onValueChange={(value) =>
                        setAccountType(value as "existing" | "new")
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existing">
                          Existing Account
                        </TabsTrigger>
                        <TabsTrigger value="new">New Account</TabsTrigger>
                      </TabsList>

                      <TabsContent value="existing" className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="account">Select Account</Label>
                          <Select
                            onValueChange={setSelectedAccount}
                            defaultValue={
                              existingAccounts.length > 0
                                ? existingAccounts[0].id
                                : ""
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                              {existingAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.provider} -{" "}
                                  {account.accessKey.substring(0, 8)}...
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {existingAccounts.length === 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              No existing accounts found. Please add a new
                              account.
                            </p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="new" className="mt-4">
                        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                          <p className="text-sm text-muted-foreground">
                            You'll be able to enter your credentials in the next
                            step.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
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
                    {accountType === "existing" ? (
                      <>
                        <h3 className="text-lg font-medium mb-4">
                          Select or Add Bucket
                        </h3>

                        <div className="space-y-4">
                          {existingBuckets && existingBuckets.length > 0 ? (
                            <div className="space-y-3">
                              <Label>Existing Buckets</Label>
                              <div className="grid gap-3">
                                {existingBuckets.map((bucket, index) => (
                                  <BucketCard
                                    key={index}
                                    id={`bucket-${index}`}
                                    name={bucket.name}
                                    format={bucket.format || ""}
                                    selected={selectedBucket === bucket.name}
                                    onClick={() =>
                                      setSelectedBucket(bucket.name)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                              <p className="text-sm text-muted-foreground">
                                No existing buckets found. Please add a new
                                bucket.
                              </p>
                            </div>
                          )}

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                Or add new bucket
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newBucket">New Bucket Name</Label>
                            <Input
                              id="newBucket"
                              placeholder="my-new-bucket"
                              value={newBucketName}
                              onChange={(e) => setNewBucketName(e.target.value)}
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium mb-4">
                          Enter Account Credentials
                        </h3>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="provider">Cloud Provider</Label>
                            <Select
                              defaultValue="aws"
                              onValueChange={(value) =>
                                handleInputChange("provider", value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aws">
                                  Amazon Web Services
                                </SelectItem>
                                <SelectItem value="azure">
                                  Microsoft Azure
                                </SelectItem>
                                <SelectItem value="minio">MinIO</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="accessKey">Access Key</Label>
                            <Input
                              id="accessKey"
                              placeholder="AKIA..."
                              value={formData.accessKey}
                              onChange={(e) =>
                                handleInputChange("accessKey", e.target.value)
                              }
                              className="bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="secretKey">Secret Key</Label>
                            <Input
                              id="secretKey"
                              type="password"
                              placeholder="••••••••"
                              value={formData.secretKey}
                              onChange={(e) =>
                                handleInputChange("secretKey", e.target.value)
                              }
                              className="bg-background"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bucketName">Bucket Name</Label>
                            <Input
                              id="bucketName"
                              placeholder="my-bucket"
                              value={formData.bucketName}
                              onChange={(e) =>
                                handleInputChange("bucketName", e.target.value)
                              }
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </>
                    )}
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
                    <h3 className="text-lg font-medium mb-4">Table Format</h3>

                    <div className="space-y-4">
                      <RadioGroup
                        defaultValue="hudi"
                        onValueChange={(value) => {
                          setTableFormat(value);
                          handleInputChange("tableFormat", value);
                        }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="hudi" id="hudi" />
                          <Label
                            htmlFor="hudi"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">Apache Hudi</div>
                            <div className="text-xs text-muted-foreground">
                              Incremental data processing
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="delta" id="delta" />
                          <Label
                            htmlFor="delta"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">Delta Lake</div>
                            <div className="text-xs text-muted-foreground">
                              ACID transactions on data lakes
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="iceberg" id="iceberg" />
                          <Label
                            htmlFor="iceberg"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">Apache Iceberg</div>
                            <div className="text-xs text-muted-foreground">
                              High-performance format for huge tables
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {isLoading && accountType === "new" && (
                      <ConnectionProgress
                        provider={formData.provider}
                        isConnected={isConnected}
                        accessKey={formData.accessKey}
                        secretKey={formData.secretKey}
                        bucketName={formData.bucketName}
                        newID={userData?.id || ""}
                      />
                    )}

                    {isLoading && accountType === "existing" && (
                      <div className="mt-6 pt-4 border-t border-border/50 rounded-md">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <p className="text-sm">Adding catalog...</p>
                        </div>
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
                  onClick={() => navigate({ to: "/Dashboard" })}
                  className="gap-1 hover:bg-background/80"
                >
                  Cancel
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
                      {accountType === "new" ? "Connecting..." : "Adding..."}
                    </>
                  ) : isConnected ? (
                    <>
                      <Check className="h-4 w-4" />
                      Connected!
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Catalog
                    </>
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
