"use client";

import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./layout/app-sidebar";
import { DashboardOverview } from "./dashboard-overview";
import { BucketOverview } from "./bucket-overview";
import { SchemaViewer } from "./schema-viewer";
import { TableProperties } from "./table-properties";
import { PartitionDetails } from "./partition-details";
import { VersionHistory } from "./version-history";
import { StorageMetrics } from "./storage-metrics";
import { TrinoQueryEditor } from "./trino-query-editor";
import { TableSelector } from "./table-selector";
import { SchemaComparison } from "./schema-comparison";
import { Button } from "@/components/ui/button";
import { Search, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import useUser from "@/hooks/useUser";
import api from "@/services/AxiosInterceptor";
import LoadingSkeleton from "./loading";
import { DeltaVersionSelector } from "./Delta/delta-version-selector";
import { HudiTimeTravel } from "./Hudi /hudi-time-travel";
import { useTableList } from "@/hooks/useTableList";
import { FormatProvider, useFormat } from "@/context/FormatContext";
import ParquetViewer from "./Parquet";
import Home from "./Delta";
import { HudiSchemaViewer } from "./Hudi /HudiSchemaViewer";
import HudiDashboard from "./Hudi ";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTable, setSelectedTable] = useState(
    "iceberg_supplier-3d95078ec1de4185a013ef3672a8e473"
  );
  const { data: userData, isLoading } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [sampleMetadata, setMetadata] = useState("");
  const [format, setFormat] = useState<string | undefined>();
  const { data: tableList, isLoading: isTableLoading } = useTableList(
    userData?.buckets[0].name
  );

  useEffect(() => {
    if (!userData) return;

    async function fetchMetadata() {
      try {
        console.log("Fetching metadata...");
        console.log("userData", userData);
        console.log("Bucket", userData?.buckets[0].name);
        console.log("Table", selectedTable);

        const response = await api.post("ice-burg/data", {
          bucketName: userData?.buckets[0].name,
          location: selectedTable,
        });
        console.log("Data Fetched", response);
        setMetadata(response.data);
      } catch (error) {
        throw error;
      }
    }
    fetchMetadata();
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!userData) return;
    async function fetchMetadata() {
      try {
        console.log("The Format of the Table is ", format);

        const response = await api.post("ice-burg/data", {
          bucketName: userData?.buckets[0].name,
          location: selectedTable,
        });
        console.log(response);
        setMetadata(response.data);
      } catch (error) {
        throw error;
      }
    }
    fetchMetadata();
    setIsMounted(true);
  }, [userData, selectedTable]);

  if (!isMounted) {
    return null;
  }
  if (isLoading && userData && !isTableLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex-1 overflow-auto">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/40 bg-background/95 px-6 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 w-3xl">
                <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[oklch(0.6_0.2_280)]">
                  {activeTab === "dashboard"
                    ? "Dashboard"
                    : activeTab === "overview"
                      ? "Bucket Overview"
                      : activeTab === "tables"
                        ? "Tables"
                        : activeTab === "schema"
                          ? "Schema"
                          : activeTab === "partitions"
                            ? "Partitions"
                            : activeTab === "versions"
                              ? "Version History"
                              : activeTab === "metrics"
                                ? "Storage Metrics"
                                : activeTab === "trino"
                                  ? "Trino Query Editor"
                                  : ""}
                </h1>
              </div>

              {activeTab !== "dashboard" && activeTab !== "overview" && (
                <div className="ml-auto">
                  <TableSelector
                    selectedTable={selectedTable}
                    onSelectTable={setSelectedTable}
                    setSelectedTable={setSelectedTable}
                    setFormat={setFormat}
                  />
                </div>
              )}

              {(activeTab === "dashboard" || activeTab === "overview") && (
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <GitBranch className="h-4 w-4" />
                    <span>Refresh</span>
                  </Button>
                  <Button size="sm" className="h-9 gap-1">
                    <Search className="h-4 w-4" />
                    <span>Discover Tables</span>
                  </Button>
                </div>
              )}
            </motion.header>

            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6"
            >
              {activeTab === "dashboard" && <DashboardOverview />}
              {activeTab === "overview" && (
                <BucketOverview metadata={sampleMetadata} />
              )}
              {activeTab === "schema" && (
                <SchemaViewer metadata={sampleMetadata} />
              )}
              {activeTab === "partitions" && (
                <PartitionDetails metadata={sampleMetadata} />
              )}
              {activeTab === "versions" && (
                <VersionHistory metadata={sampleMetadata} />
              )}
              {activeTab === "metrics" && (
                <StorageMetrics metadata={sampleMetadata} />
              )}
              {activeTab === "tables" && (
                <TableProperties metadata={sampleMetadata} />
              )}
              {activeTab === "trino" && (
                <TrinoQueryEditor sampleMetadata={sampleMetadata} />
              )}
              {activeTab === "Comparison" && (
                <SchemaComparison metadata={sampleMetadata} />
              )}
              {activeTab === "parquetDetails" && <ParquetViewer />}
              {activeTab === "deltaDetails" && (
                <Home selectedTable={selectedTable} />
              )}
              {activeTab === "hudiDetails" && <HudiDashboard />}
            </motion.main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
