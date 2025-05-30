"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cloud,
  Database,
  Key,
  User,
  Server,
  Shield,
  Layers,
  Plus,
  ExternalLink,
  Mail,
  Calendar,
  PlusCircle,
  CloudCog, // Added for GCP
} from "lucide-react";
import { motion } from "framer-motion";
import useUser from "@/hooks/useUser";
import { Link, useNavigate } from "@tanstack/react-router";

interface UserData {
  id: string;
  appwriteId: string;
  email: string;
  instanceId: null;
  createdAt: string;
  credentials: {
    id: string;
    userId: string;
    provider: string;
    accessKey: string;
    secretKey: string;
    createdAt: string;
  }[];
  buckets: {
    id: string;
    userId: string;
    name: string;
    provider: string;
    format: null;
    metadata: null;
    createdAt: string;
    updatedAt: string;
  }[];
  queryHistory: any[];
}

export function DashboardOverview({}) {
  const { data: userData } = useUser();
  const navigate = useNavigate();
  if (!userData) return null;
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getInitials = (email: string) => {
    return email.split("@")[0].substring(0, 2).toUpperCase();
  };

  const formatCredential = (credential: string) => {
    if (!credential) return "••••••••";
    return (
      credential.substring(0, 3) +
      "••••••••" +
      credential.substring(credential.length - 3)
    );
  };

  const hasProvider = (provider: string) => {
    return userData?.credentials.some(
      (cred) => cred.provider.toLowerCase() === provider.toLowerCase()
    );
  };

  const getProviderBuckets = (provider: string) => {
    return userData?.buckets.filter(
      (bucket) => bucket.provider.toLowerCase() === provider.toLowerCase()
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const handleAddProvider = (provider: string) => {
    console.log(`Adding ${provider} provider`);
    navigate({
      to: "/AddCatalog",
      search: { provider },
    });
  };

  const handleAddCatalog = () => {
    console.log("Adding new catalog provider");
    navigate({
      to: "/AddCatalog",
    });
  };

  return (
    <div className="space-y-8">
      {/* User Profile Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="border-[#D3EFFF]/60 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative md:col-span-1">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#2755D1]"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-3 text-[#2755D1]">
              <span className="bg-gradient-to-r from-[#2755D1] to-[#50AFFF] p-2 rounded-md text-white">
                <User className="h-5 w-5" />
              </span>
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="h-24 w-24 mb-4 bg-gradient-to-br from-[#2755D1] to-[#50AFFF] text-white">
                <AvatarFallback className="text-2xl">
                  {getInitials(userData?.email!)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-[#2755D1]">
                {userData?.email.split("@")[0]}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="h-4 w-4" />
                <span>{userData?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(userData?.createdAt!).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  User ID
                </span>
                <span className="text-sm font-mono bg-slate-100 p-1 rounded">
                  {userData?.id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Appwrite ID
                </span>
                <span className="text-sm font-mono bg-slate-100 p-1 rounded">
                  {userData?.appwriteId.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Buckets
                </span>
                <Badge
                  variant="outline"
                  className="bg-[#2755D1]/10 text-[#2755D1]"
                >
                  {userData?.buckets.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Credentials
                </span>
                <Badge
                  variant="outline"
                  className="bg-[#2755D1]/10 text-[#2755D1]"
                >
                  {userData?.credentials.length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#D3EFFF]/60 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative md:col-span-2">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2755D1] via-[#50AFFF] to-[#3088E8]"></div>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-3 text-[#2755D1]">
                <span className="bg-gradient-to-r from-[#2755D1] to-[#3088E8] p-2 rounded-md text-white">
                  <Cloud className="h-5 w-5" />
                </span>
                Cloud Providers
              </CardTitle>
              <CardDescription className="text-[#3088E8]/70">
                Connected cloud storage providers
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2755D1] text-[#2755D1] hover:bg-[#2755D1]/10"
              onClick={handleAddCatalog}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Add Provider
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="aws" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-[#D3EFFF]/30">
                <TabsTrigger
                  value="aws"
                  className="data-[state=active]:bg-[#FF9900] data-[state=active]:text-white"
                >
                  AWS
                </TabsTrigger>
                <TabsTrigger
                  value="azure"
                  className="data-[state=active]:bg-[#0078D4] data-[state=active]:text-white"
                >
                  Azure
                </TabsTrigger>
                <TabsTrigger
                  value="gcp"
                  className="data-[state=active]:bg-[#4285F4] data-[state=active]:text-white"
                >
                  GCP
                </TabsTrigger>
                <TabsTrigger
                  value="minio"
                  className="data-[state=active]:bg-[#C72C48] data-[state=active]:text-white"
                >
                  MinIO
                </TabsTrigger>
              </TabsList>

              {/* AWS Tab */}
              <TabsContent value="aws">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {hasProvider("aws") ? (
                    <>
                      {userData?.credentials
                        .filter((cred) => cred.provider === "aws")
                        .map((cred, index) => (
                          <motion.div
                            key={cred.id}
                            variants={itemVariants}
                            className="space-y-4"
                          >
                            <div className="bg-[#FF9900]/10 p-4 rounded-lg border border-[#FF9900]/20">
                              <h3 className="text-lg font-semibold text-[#FF9900] mb-3 flex items-center gap-2">
                                <Key className="h-4 w-4" /> AWS Credentials
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Your credentials are securely stored
                              </p>
                              <p className="text-xs text-muted-foreground mt-3">
                                Created: {formatTimestamp(cred.createdAt)}
                              </p>
                            </div>

                            {getProviderBuckets("aws").length > 0 && (
                              <div className="overflow-hidden">
                                <h3 className="text-md font-semibold text-[#FF9900] mb-3 flex items-center gap-2">
                                  <Database className="h-4 w-4" /> AWS Buckets
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-[#FF9900]/5">
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {getProviderBuckets("aws").map(
                                        (bucket) => (
                                          <TableRow key={bucket.id}>
                                            <TableCell className="font-medium">
                                              {bucket.name}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.createdAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.updatedAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Server className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No AWS Credentials
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mb-4">
                        You haven't connected any AWS credentials yet.
                      </p>
                      <Button
                        className="bg-[#FF9900] hover:bg-[#FF9900]/90"
                        onClick={() => handleAddProvider("aws")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add AWS Credentials
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Azure Tab */}
              <TabsContent value="azure">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {hasProvider("azure") ? (
                    <>
                      {userData?.credentials
                        .filter((cred) => cred.provider === "azure")
                        .map((cred, index) => (
                          <motion.div
                            key={cred.id}
                            variants={itemVariants}
                            className="space-y-4"
                          >
                            <div className="bg-[#0078D4]/10 p-4 rounded-lg border border-[#0078D4]/20">
                              <h3 className="text-lg font-semibold text-[#0078D4] mb-3 flex items-center gap-2">
                                <Key className="h-4 w-4" /> Azure Credentials
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Your credentials are securely stored
                              </p>
                              <p className="text-xs text-muted-foreground mt-3">
                                Created: {formatTimestamp(cred.createdAt)}
                              </p>
                            </div>

                            {getProviderBuckets("azure").length > 0 && (
                              <div className="overflow-hidden">
                                <h3 className="text-md font-semibold text-[#0078D4] mb-3 flex items-center gap-2">
                                  <Database className="h-4 w-4" /> Azure Buckets
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-[#0078D4]/5">
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {getProviderBuckets("azure").map(
                                        (bucket) => (
                                          <TableRow key={bucket.id}>
                                            <TableCell className="font-medium">
                                              {bucket.name}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.createdAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.updatedAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Server className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No Azure Credentials
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mb-4">
                        You haven't connected any Azure credentials yet.
                      </p>

                      <Button
                        className="bg-[#0078D4] hover:bg-[#0078D4]/90"
                        onClick={() => handleAddProvider("azure")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Azure Credentials
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* GCP Tab */}
              <TabsContent value="gcp">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {hasProvider("gcp") ? (
                    <>
                      {userData?.credentials
                        .filter((cred) => cred.provider === "gcp")
                        .map((cred, index) => (
                          <motion.div
                            key={cred.id}
                            variants={itemVariants}
                            className="space-y-4"
                          >
                            <div className="bg-[#4285F4]/10 p-4 rounded-lg border border-[#4285F4]/20">
                              <h3 className="text-lg font-semibold text-[#4285F4] mb-3 flex items-center gap-2">
                                <Key className="h-4 w-4" /> GCP Credentials
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Your credentials are securely stored
                              </p>
                              <p className="text-xs text-muted-foreground mt-3">
                                Created: {formatTimestamp(cred.createdAt)}
                              </p>
                            </div>

                            {getProviderBuckets("gcp").length > 0 && (
                              <div className="overflow-hidden">
                                <h3 className="text-md font-semibold text-[#4285F4] mb-3 flex items-center gap-2">
                                  <Database className="h-4 w-4" /> GCP Buckets
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-[#4285F4]/5">
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {getProviderBuckets("gcp").map(
                                        (bucket) => (
                                          <TableRow key={bucket.id}>
                                            <TableCell className="font-medium">
                                              {bucket.name}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.createdAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.updatedAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CloudCog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No GCP Credentials
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mb-4">
                        You haven't connected any Google Cloud credentials yet.
                      </p>
                      <Button
                        className="bg-[#4285F4] hover:bg-[#4285F4]/90"
                        onClick={() => handleAddProvider("gcp")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add GCP Credentials
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* MinIO Tab */}
              <TabsContent value="minio">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-6"
                >
                  {hasProvider("minio") ? (
                    <>
                      {userData?.credentials
                        .filter((cred) => cred.provider === "minio")
                        .map((cred, index) => (
                          <motion.div
                            key={cred.id}
                            variants={itemVariants}
                            className="space-y-4"
                          >
                            <div className="bg-[#C72C48]/10 p-4 rounded-lg border border-[#C72C48]/20">
                              <h3 className="text-lg font-semibold text-[#C72C48] mb-3 flex items-center gap-2">
                                <Key className="h-4 w-4" /> MinIO Credentials
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Your credentials are securely stored
                              </p>
                              <p className="text-xs text-muted-foreground mt-3">
                                Created: {formatTimestamp(cred.createdAt)}
                              </p>
                            </div>

                            {getProviderBuckets("minio").length > 0 && (
                              <div className="overflow-hidden">
                                <h3 className="text-md font-semibold text-[#C72C48] mb-3 flex items-center gap-2">
                                  <Database className="h-4 w-4" /> MinIO Buckets
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader className="bg-[#C72C48]/5">
                                      <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Updated</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {getProviderBuckets("minio").map(
                                        (bucket) => (
                                          <TableRow key={bucket.id}>
                                            <TableCell className="font-medium">
                                              {bucket.name}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.createdAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                              {new Date(
                                                bucket.updatedAt
                                              ).toLocaleDateString()}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Server className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No MinIO Credentials
                      </h3>
                      <p className="text-sm text-muted-foreground/70 mb-4">
                        You haven't connected any MinIO credentials yet.
                      </p>
                      <Button
                        className="bg-[#C72C48] hover:bg-[#C72C48]/90"
                        onClick={() => handleAddProvider("minio")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add MinIO Credentials
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-[#D3EFFF]/60 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2755D1] via-[#3088E8] to-[#D3EFFF]"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-3 text-[#2755D1]">
              <span className="bg-gradient-to-r from-[#2755D1] to-[#3088E8] p-2 rounded-md text-white">
                <Shield className="h-5 w-5" />
              </span>
              Security & Access
            </CardTitle>
            <CardDescription className="text-[#3088E8]/70">
              Manage your security settings and access controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="bg-gradient-to-br from-[#2755D1]/5 to-[#50AFFF]/5 p-6 rounded-lg border border-[#2755D1]/10">
                  <h3 className="text-lg font-semibold text-[#2755D1] mb-4">
                    Access Management
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-[#2755D1]" />
                        <span className="text-sm">API Keys</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-[#2755D1]/10 text-[#2755D1]"
                      >
                        {userData?.credentials.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-[#50AFFF]" />
                        <span className="text-sm">Storage Buckets</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-[#50AFFF]/10 text-[#50AFFF]"
                      >
                        {userData?.buckets.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#3088E8]" />
                        <span className="text-sm">Query History</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-[#3088E8]/10 text-[#3088E8]"
                      >
                        {userData?.queryHistory?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button className="w-full bg-[#2755D1] hover:bg-[#2755D1]/90">
                      Manage Access
                    </Button>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                <div className="bg-gradient-to-br from-[#3088E8]/5 to-[#A5D8FF]/5 p-6 rounded-lg border border-[#3088E8]/10">
                  <h3 className="text-lg font-semibold text-[#3088E8] mb-4">
                    Recent Activity
                  </h3>
                  {userData?.buckets.length! > 0 ? (
                    <div className="space-y-3">
                      {userData?.buckets.slice(0, 3).map((bucket, index) => (
                        <div
                          key={bucket.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#3088E8]/10"
                        >
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-[#3088E8]" />
                            <div>
                              <p className="text-sm font-medium">
                                {bucket.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Updated{" "}
                                {new Date(
                                  bucket.updatedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">
                        No recent activity
                      </p>
                    </div>
                  )}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="w-full border-[#3088E8] text-[#3088E8] hover:bg-[#3088E8]/10"
                    >
                      View All Activity
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
