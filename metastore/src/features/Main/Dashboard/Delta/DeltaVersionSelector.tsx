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
import { Clock, GitCommit, Calendar, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
  numRecords: number | null;
  numAddedFiles: number;
  numRemovedFiles: number;
  sizeBytes: number;
}

export function DeltaVersionSelector({ metadata }: DeltaVersionSelectorProps) {
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Process metadata to extract version information
  useEffect(() => {
    if (metadata) {
      try {
        // Extract version information from the metadata
        const processedVersions = processMetadataToVersions(metadata);
        setVersions(processedVersions);
      } catch (error) {
        console.error("Error processing metadata:", error);
        // Fallback to empty versions array
        setVersions([]);
      }
    }
  }, [metadata]);

  // Process Delta Lake metadata into version information
  const processMetadataToVersions = (metadata: any): VersionData[] => {
    // Handle case where metadata is undefined or null
    if (!metadata) return [];

    // Extract snapshots from metadata or use empty array if not available
    const snapshots = metadata.snapshots || [];

    // Map snapshots to version data
    return snapshots.map((snapshot: any, index: number) => {
      // Get manifest information if available
      const manifestInfo = getManifestInfo(metadata, snapshot);

      // Create version data with safe fallbacks for all properties
      return {
        version: snapshot?.["snapshot-id"] ?? index,
        timestamp: new Date(
          snapshot?.["timestamp-ms"] ?? Date.now()
        ).toISOString(),
        operation: snapshot?.summary?.operation ?? "UNKNOWN",
        operationParameters: snapshot?.summary ?? {},
        isCurrent: index === 0, // Assume the first snapshot is current
        numFiles: manifestInfo.fileCount,
        numRecords: manifestInfo.recordCount,
        numAddedFiles: manifestInfo.fileCount, // Simplified - in a real app would track changes
        numRemovedFiles: 0, // Simplified - in a real app would track changes
        sizeBytes: manifestInfo.totalSize,
      };
    });
  };

  // Extract manifest information from metadata
  const getManifestInfo = (metadata: any, snapshot: any) => {
    // Default values
    let fileCount = 0;
    let recordCount = null;
    let totalSize = 0;

    try {
      // Get manifests array or use empty array if not available
      const manifests = metadata.manifests || [];

      // Count files and sum sizes
      fileCount = manifests.length;

      // Sum up file sizes
      totalSize = manifests.reduce((sum: number, manifest: any) => {
        return sum + (manifest?.["file-size-in-bytes"] ?? 0);
      }, 0);

      // Get record count if available
      const firstManifestWithRecords = manifests.find(
        (m: any) => m?.["record-count"] !== null
      );
      recordCount = firstManifestWithRecords?.["record-count"] ?? null;
    } catch (error) {
      console.error("Error extracting manifest info:", error);
    }

    return { fileCount, recordCount, totalSize };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const refreshVersions = async () => {
    setIsLoading(true);
    try {
      // This would be implemented in the parent component
      // and passed down as a prop in a real application
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing versions:", error);
      setIsLoading(false);
    }
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
          {versions.length > 0 ? (
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
                      <TableCell>
                        {version.numRecords?.toLocaleString() ?? "N/A"}
                      </TableCell>
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No version history available for this Delta table.
            </div>
          )}
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
                        {selectedVersion.numRecords?.toLocaleString() ?? "N/A"}
                      </div>
                    </div>
                    {selectedVersion.numFiles > 0 && (
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
                    )}
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
                              minReaderVersion:
                                metadata?.["format-version"] ?? 1,
                              minWriterVersion:
                                metadata?.["format-version"] ?? 1,
                            },
                            metadata: {
                              id: metadata?.["table-uuid"] ?? "unknown",
                              format: {
                                provider: "parquet",
                                options: {},
                              },
                              schemaString: JSON.stringify(
                                metadata?.schemas?.[0] ?? {}
                              ),
                              partitionColumns:
                                metadata?.["partition-specs"]?.[0]?.fields ??
                                [],
                              configuration: {},
                              createdTime:
                                metadata?.["last-updated-ms"] ?? Date.now(),
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
