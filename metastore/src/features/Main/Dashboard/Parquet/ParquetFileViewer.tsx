"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { File, HardDrive, Gauge, Calendar, Hash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParquetFileViewerProps {
  metadata: any;
}

export function ParquetFileViewer({ metadata }: ParquetFileViewerProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <HardDrive className="h-5 w-5" />
                </span>
                Parquet Files
              </CardTitle>
              <CardDescription>
                File details for{" "}
                <Badge variant="outline">
                  {metadata?.table_name || "Unknown"}
                </Badge>
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {metadata?.total_files} files,{" "}
              {metadata?.total_rows?.toLocaleString()} rows
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {metadata?.partitions?.map((partition: any) => (
                <div
                  key={partition.s3_path}
                  className="rounded-lg border border-border/40 p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">
                        {partition.s3_path.split("/").pop()}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {formatBytes(partition.file_size_bytes)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Rows
                        </div>
                        <div>{partition.row_count.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Row Groups
                        </div>
                        <div>{partition.num_row_groups}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Last Modified
                        </div>
                        <div>{formatDate(partition.last_modified)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Compression
                        </div>
                        <Badge variant="outline">{partition.compression}</Badge>
                      </div>
                    </div>
                  </div>

                  {partition.partition_values && (
                    <div className="mt-4">
                      <div className="text-xs text-muted-foreground mb-1">
                        Partition Values
                      </div>
                      <div className="flex gap-2">
                        {Object.entries(partition.partition_values).map(
                          ([key, value]) => (
                            <Badge
                              key={key}
                              variant="outline"
                              className="capitalize"
                            >
                              {key}: {String(value)}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
