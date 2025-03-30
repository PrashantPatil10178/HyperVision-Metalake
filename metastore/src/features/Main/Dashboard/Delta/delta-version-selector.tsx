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
import { Button } from "@/components/ui/button";
import { Clock, GitCommit, Calendar, RefreshCw, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeltaVersionSelectorProps {
  metadata: any;
}

// Define a proper interface for version data
interface VersionData {
  version: number;
  timestamp: string;
  operation: string;
  operationParameters: Record<string, any>;
  isCurrent: boolean;
  numFiles: number;
  numRecords: number;
  numAddedFiles: number;
  numRemovedFiles: number;
  sizeBytes: number;
}

export function DeltaVersionSelector({ metadata }: DeltaVersionSelectorProps) {
  // Mock Delta version history with proper typing
  const [versions, setVersions] = useState<VersionData[]>([
    {
      version: 3,
      timestamp: "2023-11-15T10:30:00Z",
      operation: "MERGE",
      operationParameters: { predicate: "id > 1000" },
      isCurrent: true,
      numFiles: 42,
      numRecords: 125000,
      numAddedFiles: 12,
      numRemovedFiles: 3,
      sizeBytes: 456789012,
    },
    {
      version: 2,
      timestamp: "2023-11-14T15:45:00Z",
      operation: "UPDATE",
      operationParameters: { condition: "status = 'active'" },
      isCurrent: false,
      numFiles: 33,
      numRecords: 98000,
      numAddedFiles: 8,
      numRemovedFiles: 2,
      sizeBytes: 321456789,
    },
    {
      version: 1,
      timestamp: "2023-11-13T09:15:00Z",
      operation: "WRITE",
      operationParameters: { mode: "Overwrite" },
      isCurrent: false,
      numFiles: 25,
      numRecords: 75000,
      numAddedFiles: 25,
      numRemovedFiles: 0,
      sizeBytes: 234567890,
    },
    {
      version: 0,
      timestamp: "2023-11-12T08:00:00Z",
      operation: "CREATE TABLE",
      operationParameters: {},
      isCurrent: false,
      numFiles: 0,
      numRecords: 0,
      numAddedFiles: 0,
      numRemovedFiles: 0,
      sizeBytes: 0,
    },
  ]);

  const [selectedVersion, setSelectedVersion] = useState<VersionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const refreshVersions = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const viewVersionDetails = (version: VersionData) => {
    setSelectedVersion(version);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#20a7b6]/10 text-[#20a7b6] p-1 rounded">
                  <Clock className="h-5 w-5" />
                </span>
                Version History
              </CardTitle>
              <CardDescription>
                Explore and restore previous versions of this Delta table
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshVersions}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((version) => (
                  <TableRow
                    key={version.version}
                    className={cn(version.isCurrent ? "bg-[#20a7b6]/5" : "")}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {version.version}
                        {version.isCurrent && (
                          <Badge className="bg-[#20a7b6] hover:bg-[#1d96a4] text-white">
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize bg-[#20a7b6]/10 text-[#20a7b6] border-[#20a7b6]/20"
                      >
                        {version.operation.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(version.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <span className="text-green-600">
                          +{version.numAddedFiles}
                        </span>
                        {version.numRemovedFiles > 0 && (
                          <span className="text-red-600">
                            -{version.numRemovedFiles}
                          </span>
                        )}
                        <span>({version.numFiles})</span>
                      </div>
                    </TableCell>
                    <TableCell>{version.numRecords.toLocaleString()}</TableCell>
                    <TableCell>{formatBytes(version.sizeBytes)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewVersionDetails(version)}
                        className="text-[#20a7b6] hover:text-[#1d96a4] hover:bg-[#20a7b6]/10 border-[#20a7b6]/30"
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Version Details Dialog */}
      <Dialog
        open={!!selectedVersion}
        onOpenChange={(open) => !open && setSelectedVersion(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#20a7b6]">
              <GitCommit className="h-5 w-5" />
              Version {selectedVersion?.version} Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedVersion && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Timestamp
                    </div>
                    <div className="font-medium">
                      {formatDate(selectedVersion.timestamp)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Operation
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="capitalize bg-[#20a7b6]/10 text-[#20a7b6] border-[#20a7b6]/20"
                      >
                        {selectedVersion.operation.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>
                      <Badge
                        variant={
                          selectedVersion.isCurrent ? "default" : "outline"
                        }
                        className={
                          selectedVersion.isCurrent
                            ? "bg-[#20a7b6] hover:bg-[#1d96a4] text-white"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedVersion.isCurrent ? "Current" : "Historical"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Table Size
                    </div>
                    <div className="font-medium">
                      {formatBytes(selectedVersion.sizeBytes)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Operation Parameters</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(
                        selectedVersion.operationParameters,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">File Statistics</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#20a7b6]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Total Files
                      </div>
                      <div className="font-semibold text-[#20a7b6]">
                        {selectedVersion.numFiles.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#20a7b6]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Added Files
                      </div>
                      <div className="font-semibold text-[#20a7b6]">
                        {selectedVersion.numAddedFiles.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#20a7b6]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Removed Files
                      </div>
                      <div className="font-semibold text-[#20a7b6]">
                        {selectedVersion.numRemovedFiles.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#20a7b6]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Total Records
                      </div>
                      <div className="font-semibold text-[#20a7b6]">
                        {selectedVersion.numRecords.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#20a7b6]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Avg File Size
                      </div>
                      <div className="font-semibold text-[#20a7b6]">
                        {formatBytes(
                          selectedVersion.sizeBytes / selectedVersion.numFiles
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Metadata</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(
                        {
                          version: selectedVersion.version,
                          timestamp: selectedVersion.timestamp,
                          operation: selectedVersion.operation,
                          operationParameters:
                            selectedVersion.operationParameters,
                          metrics: {
                            numFiles: selectedVersion.numFiles,
                            numRecords: selectedVersion.numRecords,
                            numAddedFiles: selectedVersion.numAddedFiles,
                            numRemovedFiles: selectedVersion.numRemovedFiles,
                            sizeBytes: selectedVersion.sizeBytes,
                          },
                          delta: {
                            protocol: {
                              minReaderVersion: 1,
                              minWriterVersion: 2,
                            },
                            metadata: {
                              id: "f79d3b8e-708b-4e18-b011-8c7a4d3a8c1d",
                              format: {
                                provider: "parquet",
                                options: {},
                              },
                              schemaString: JSON.stringify({
                                type: "struct",
                                fields: [
                                  {
                                    name: "id",
                                    type: "long",
                                    nullable: false,
                                    metadata: {},
                                  },
                                  {
                                    name: "data",
                                    type: "string",
                                    nullable: true,
                                    metadata: {},
                                  },
                                ],
                              }),
                              partitionColumns: [],
                              configuration: {},
                              createdTime: 1672531200000,
                            },
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedVersion(null)}
              className="border-[#20a7b6]/30 text-[#20a7b6] hover:bg-[#20a7b6]/10"
            >
              Close
            </Button>
            <Button
              variant="default"
              className="bg-[#20a7b6] hover:bg-[#1d96a4]"
            >
              Time Travel to This Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
