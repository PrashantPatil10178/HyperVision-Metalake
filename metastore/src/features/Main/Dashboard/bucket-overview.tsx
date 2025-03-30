"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Database, FileType, Clock } from "lucide-react";

interface BucketOverviewProps {
  metadata: any;
}

export function BucketOverview({ metadata }: BucketOverviewProps) {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Sample tables for demo
  const tables = [
    {
      name: "NYC Taxi",
      format: "Iceberg",
      location: "s3://om-jadhav-iceburg-test/nyc_taxi_iceberg",
      lastUpdated: metadata["last-updated-ms"],
      records: metadata.snapshots?.[0]?.summary?.["total-records"] || "164,263",
      size: "2.97 MB",
    },
    {
      name: "Customer Orders",
      format: "Delta",
      location: "s3://om-jadhav-iceburg-test/customer_orders_delta",
      lastUpdated: Date.now() - 86400000 * 2,
      records: "1,245,678",
      size: "156.4 MB",
    },
    {
      name: "Product Catalog",
      format: "Hudi",
      location: "s3://om-jadhav-iceburg-test/product_catalog_hudi",
      lastUpdated: Date.now() - 86400000 * 5,
      records: "87,432",
      size: "42.1 MB",
    },
    {
      name: "Web Analytics",
      format: "Parquet",
      location: "s3://om-jadhav-iceburg-test/web_analytics_parquet",
      lastUpdated: Date.now() - 86400000 * 1,
      records: "5,432,109",
      size: "312.7 MB",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tables
                </p>
                <h3 className="text-2xl font-bold mt-1">4</h3>
              </div>
              <div className="bg-[var(--chart-1)]/10 p-3 rounded-full">
                <Database className="h-5 w-5 text-[var(--chart-1)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Size
                </p>
                <h3 className="text-2xl font-bold mt-1">514.2 MB</h3>
              </div>
              <div className="bg-[var(--chart-2)]/10 p-3 rounded-full">
                <FileType className="h-5 w-5 text-[var(--chart-2)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Records
                </p>
                <h3 className="text-2xl font-bold mt-1">6.9M</h3>
              </div>
              <div className="bg-[var(--chart-3)]/10 p-3 rounded-full">
                <Package className="h-5 w-5 text-[var(--chart-3)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <h3 className="text-lg font-bold mt-1">Today</h3>
              </div>
              <div className="bg-[var(--chart-4)]/10 p-3 rounded-full">
                <Clock className="h-5 w-5 text-[var(--chart-4)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables in Bucket */}
      <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-[var(--primary)]/10 text-[var(--primary)] p-1 rounded">
              <Database className="h-5 w-5" />
            </span>
            Tables in Bucket
          </CardTitle>
          <CardDescription>
            Tables found in{" "}
            <Badge variant="outline">om-jadhav-iceburg-test</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {tables.map((table, index) => (
              <Card
                key={index}
                className="overflow-hidden border-border/40 hover:shadow-md transition-shadow h-full"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{table.name}</h3>
                      <Badge
                        className={
                          table.format === "Iceberg"
                            ? "bg-[var(--chart-1)]/10 text-[var(--chart-1)]"
                            : table.format === "Delta"
                              ? "bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                              : table.format === "Hudi"
                                ? "bg-[var(--chart-3)]/10 text-[var(--chart-3)]"
                                : "bg-[var(--chart-4)]/10 text-[var(--chart-4)]"
                        }
                      >
                        {table.format}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 font-mono">
                      {table.location}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Records</p>
                        <p className="font-medium">{table.records}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Size</p>
                        <p className="font-medium">{table.size}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:w-48 bg-muted/30 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-border/40">
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-medium text-center">
                      {formatTimestamp(table.lastUpdated)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Format Distribution */}
      <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-[var(--primary)]/10 text-[var(--primary)] p-1 rounded">
              <FileType className="h-5 w-5" />
            </span>
            Format Distribution
          </CardTitle>
          <CardDescription>
            Distribution of table formats in the bucket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["Iceberg", "Delta", "Hudi", "Parquet"].map((format, index) => (
              <Card
                key={index}
                className={`bg-[var(--chart-${index + 1})]/10 border-[var(--chart-${index + 1})]/20 hover:shadow-md transition-shadow h-full`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={`text-[var(--chart-${index + 1})] text-sm font-medium`}
                    >
                      {format}
                    </div>
                    <div
                      className={`text-3xl font-bold mt-2 text-[var(--chart-${index + 1})]`}
                    >
                      1
                    </div>
                    <div className="w-full bg-[var(--chart-${index + 1})]/20 rounded-full h-2.5 mt-4">
                      <div
                        className={`bg-[var(--chart-${index + 1})] h-2.5 rounded-full`}
                        style={{ width: "25%" }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
