"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Database,
  FileJson,
  History,
  Settings,
  TableIcon,
  Layers,
  RefreshCw,
  Info,
} from "lucide-react";

// Import all Hudi components
import { HudiTimeTravel } from "./HudiTimeTravel";
import { HudiTableProperties } from "./HudiTableProperties";
import { HudiSchemaViewer } from "./HudiSchemaViewer";
import { HudiCompactionView } from "./hudi-compaction-view";

// Dummy metadata that will be replaced with API calls later
const dummyMetadata = {
  tableName: "customer_data",
  tableType: "COPY_ON_WRITE",
  version: "5",
  location: "s3://data-lake/hudi/customer_data",
  lastUpdated: Date.now() - 3600000, // 1 hour ago
  partitionFields: ["region", "date"],
  recordCount: 1250000,
  fileCount: 128,
  totalSize: "1.2GB",
  avgRecordSize: "1KB",
  schema: {
    fields: 24,
    primaryKey: "customer_id",
    partitionKey: "region",
  },
  compactionStatus: {
    lastCompactionTime: Date.now() - 86400000 * 3, // 3 days ago
    pendingCompactions: 2,
    totalCompactions: 12,
  },
};

export default function HudiDashboard() {
  const [metadata, setMetadata] = useState(dummyMetadata);
  const [isLoading, setIsLoading] = useState(false);

  // Function to simulate refreshing data
  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setMetadata({
        ...metadata,
        lastUpdated: Date.now(),
        recordCount: metadata.recordCount + Math.floor(Math.random() * 1000),
      });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hudi Table Explorer
          </h1>
          <p className="text-muted-foreground">
            Manage and explore your Apache Hudi tables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Data
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#6e45e2] hover:bg-[#5d3ac9]"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export Metadata
          </Button>
        </div>
      </div>

      {/* Table Info Card */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
              <Database className="h-5 w-5" />
            </span>
            Table Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Table Name</div>
              <div className="font-medium flex items-center gap-2">
                {metadata.tableName}
                <Badge variant="outline">{metadata.tableType}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-mono text-sm truncate max-w-[300px]">
                {metadata.location}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="font-medium">
                {new Date(metadata.lastUpdated).toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Records</div>
              <div className="font-medium">
                {metadata.recordCount.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="timetravel" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="timetravel" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Time Travel
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="compaction" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Compaction
          </TabsTrigger>
        </TabsList>

        {/* Time Travel Tab */}
        <TabsContent value="timetravel" className="mt-6">
          <HudiTimeTravel metadata={metadata} />
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties" className="mt-6">
          <HudiTableProperties metadata={metadata} />
        </TabsContent>

        {/* Schema Tab */}
        <TabsContent value="schema" className="mt-6">
          <HudiSchemaViewer metadata={metadata} />
        </TabsContent>

        {/* Compaction Tab */}
        <TabsContent value="compaction" className="mt-6">
          <HudiCompactionView metadata={metadata} />
        </TabsContent>
      </Tabs>

      {/* Footer with additional info */}
      <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>
            Apache Hudi™ is a data lake table format with rich features
          </span>
        </div>
        <div>Version: {metadata.version}</div>
      </div>
    </div>
  );
}
