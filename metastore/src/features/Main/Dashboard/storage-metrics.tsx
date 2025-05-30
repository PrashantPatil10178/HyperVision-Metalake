import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, HardDrive, FileType, BarChart } from "lucide-react";
import {
  AreaChart,
  BarChart as BarChartComponent,
  LineChart,
} from "./layout/chart";

interface StorageMetricsProps {
  metadata: any;
}

export function StorageMetrics({ metadata }: StorageMetricsProps) {
  // Get the latest snapshot summary
  const latestSnapshot = metadata.snapshots?.[metadata.snapshots.length - 1];
  const summary = latestSnapshot?.summary || {};

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Calculate average file size
  const avgFileSize =
    summary["total-data-files"] && summary["total-files-size"]
      ? Number.parseInt(summary["total-files-size"]) /
        Number.parseInt(summary["total-data-files"])
      : 0;

  // Calculate records per file
  const recordsPerFile =
    summary["total-data-files"] && summary["total-records"]
      ? Number.parseInt(summary["total-records"]) /
        Number.parseInt(summary["total-data-files"])
      : 0;

  // Sample data for charts
  const recordsData =
    metadata.snapshots?.map((snapshot: any, index: number) => ({
      name: `Snapshot ${index + 1}`,
      value: Number.parseInt(snapshot.summary?.["total-records"] || "0"),
    })) || [];

  const filesizeData =
    metadata.snapshots?.map((snapshot: any, index: number) => ({
      name: `Snapshot ${index + 1}`,
      value:
        Number.parseInt(snapshot.summary?.["total-files-size"] || "0") /
        1024 /
        1024,
    })) || [];

  const dataFilesData =
    metadata.snapshots?.map((snapshot: any, index: number) => ({
      name: `Snapshot ${index + 1}`,
      value: Number.parseInt(snapshot.summary?.["total-data-files"] || "0"),
    })) || [];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Size Card */}
        <Card className="border-border/40 shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Size
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatBytes(
                    Number.parseInt(summary["total-files-size"] || "0")
                  )}
                </h3>
              </div>
              <div className="bg-[oklch(0.98_0.02_280/0.5)] p-3 rounded-full">
                <HardDrive className="h-5 w-5 text-[oklch(0.4_0.1_280)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Records Card */}
        <Card className="border-border/40 shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Records
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {Number.parseInt(
                    summary["total-records"] || "0"
                  ).toLocaleString()}
                </h3>
              </div>
              <div className="bg-[oklch(0.98_0.02_200/0.5)] p-3 rounded-full">
                <BarChart className="h-5 w-5 text-[oklch(0.4_0.1_200)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Files Card */}
        <Card className="border-border/40 shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data Files
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {Number.parseInt(
                    summary["total-data-files"] || "0"
                  ).toLocaleString()}
                </h3>
              </div>
              <div className="bg-[oklch(0.98_0.02_140/0.5)] p-3 rounded-full">
                <FileType className="h-5 w-5 text-[oklch(0.4_0.1_140)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg File Size Card */}
        <Card className="border-border/40 shadow-sm h-full">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg File Size
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {formatBytes(avgFileSize)}
                </h3>
              </div>
              <div className="bg-[oklch(0.98_0.02_30/0.5)] p-3 rounded-full">
                <BarChart3 className="h-5 w-5 text-[oklch(0.4_0.1_30)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records Growth Chart */}
        <Card className="border-border/40 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">
                <BarChart3 className="h-5 w-5" />
              </span>
              Records Growth
            </CardTitle>
            <CardDescription>Records growth over snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AreaChart
                data={recordsData}
                index="name"
                categories={["value"]}
                colors={["#2755D1"]}
                valueFormatter={(value) => `${value.toLocaleString()} records`}
                showLegend={false}
                showGridLines={true}
                startEndOnly={false}
                showAnimation={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Growth Chart */}
        <Card className="border-border/40 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1 rounded">
                <HardDrive className="h-5 w-5" />
              </span>
              Storage Growth
            </CardTitle>
            <CardDescription>File size growth over snapshots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <AreaChart
                data={filesizeData}
                index="name"
                categories={["value"]}
                colors={["#23BFBF"]}
                valueFormatter={(value) => `${value.toFixed(2)} MB`}
                showLegend={false}
                showGridLines={true}
                startEndOnly={false}
                showAnimation={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Section */}
      <Card className="border-border/40 shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1 rounded">
              <BarChart3 className="h-5 w-5" />
            </span>
            Storage Metrics
          </CardTitle>
          <CardDescription>
            Storage statistics for{" "}
            <Badge variant="outline">
              {metadata.location.split("/").pop()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Statistics */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">File Statistics</h3>
                <div className="space-y-4">
                  {/* Total Files */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Files
                    </span>
                    <span className="font-medium">
                      {summary["total-data-files"] || 0}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>

                  {/* Added Files */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Added Files
                    </span>
                    <span className="font-medium">
                      {summary["added-data-files"] || 0}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-[oklch(0.5_0.2_140)] h-2.5 rounded-full"
                      style={{
                        width: `${
                          summary["added-data-files"] &&
                          summary["total-data-files"]
                            ? (Number.parseInt(summary["added-data-files"]) /
                                Number.parseInt(summary["total-data-files"])) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* Delete Files */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Delete Files
                    </span>
                    <span className="font-medium">
                      {summary["total-delete-files"] || 0}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-[oklch(0.5_0.2_30)] h-2.5 rounded-full"
                      style={{
                        width: `${
                          summary["total-delete-files"] &&
                          summary["total-data-files"]
                            ? (Number.parseInt(summary["total-delete-files"]) /
                                Number.parseInt(summary["total-data-files"])) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Data Files Bar Chart */}
              <div className="h-[200px]">
                <BarChartComponent
                  data={dataFilesData}
                  index="name"
                  categories={["value"]}
                  colors={["hsl(150, 70%, 50%)"]}
                  valueFormatter={(value) => `${value} files`}
                  showLegend={false}
                  showGridLines={true}
                  startEndOnly={false}
                  showAnimation={true}
                />
              </div>
            </div>

            {/* Record Statistics */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Record Statistics</h3>
                <div className="space-y-4">
                  {/* Total Records */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Records
                    </span>
                    <span className="font-medium">
                      {Number.parseInt(
                        summary["total-records"] || "0"
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>

                  {/* Added Records */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Added Records
                    </span>
                    <span className="font-medium">
                      {Number.parseInt(
                        summary["added-records"] || "0"
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-[oklch(0.5_0.2_200)] h-2.5 rounded-full"
                      style={{
                        width: `${
                          summary["added-records"] && summary["total-records"]
                            ? (Number.parseInt(summary["added-records"]) /
                                Number.parseInt(summary["total-records"])) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* Records per File */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Records per File
                    </span>
                    <span className="font-medium">
                      {Math.round(recordsPerFile).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="bg-[oklch(0.5_0.2_280)] h-2.5 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Records Line Chart */}
              <div className="h-[200px]">
                <LineChart
                  data={recordsData}
                  index="name"
                  categories={["value"]}
                  colors={["hsl(280, 70%, 50%)"]}
                  valueFormatter={(value) =>
                    `${value.toLocaleString()} records`
                  }
                  showLegend={false}
                  showGridLines={true}
                  startEndOnly={false}
                  showAnimation={true}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
