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
import { History, GitCommit, Calendar, RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define proper types for the timeline items
interface CommitInfo {
  commitTime: string;
  commit: string;
  action: string;
  recordsWritten: number;
  recordsUpdated: number;
  recordsDeleted: number;
  isCurrent: boolean;
  fileStats?: {
    baseFiles: number;
    logFiles: number;
    totalSize: string;
  };
}

interface HudiTimeTravelProps {
  metadata: {
    tableName?: string;
    tableType?: string;
    version?: string;
    location?: string;
    lastUpdated?: number;
  };
}

export function HudiTimeTravel({ metadata }: HudiTimeTravelProps) {
  // Mock Hudi timeline data with proper typing
  const [timeline, setTimeline] = useState<CommitInfo[]>([
    {
      commitTime: "2023-11-15T10:30:00Z",
      commit: "commit3",
      action: "upsert",
      recordsWritten: 1250,
      recordsUpdated: 320,
      recordsDeleted: 45,
      isCurrent: true,
      fileStats: {
        baseFiles: 12,
        logFiles: 3,
        totalSize: "128MB",
      },
    },
    {
      commitTime: "2023-11-14T15:45:00Z",
      commit: "commit2",
      action: "upsert",
      recordsWritten: 980,
      recordsUpdated: 210,
      recordsDeleted: 12,
      isCurrent: false,
      fileStats: {
        baseFiles: 10,
        logFiles: 2,
        totalSize: "98MB",
      },
    },
    {
      commitTime: "2023-11-13T09:15:00Z",
      commit: "commit1",
      action: "insert",
      recordsWritten: 1500,
      recordsUpdated: 0,
      recordsDeleted: 0,
      isCurrent: false,
      fileStats: {
        baseFiles: 8,
        logFiles: 0,
        totalSize: "75MB",
      },
    },
  ]);

  const [selectedCommit, setSelectedCommit] = useState<CommitInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const refreshTimeline = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const viewCommitDetails = (commit: CommitInfo) => {
    setSelectedCommit(commit);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <History className="h-5 w-5" />
                </span>
                Time Travel
              </CardTitle>
              <CardDescription>
                Explore historical versions of this Hudi table
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTimeline}
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
          <div className="relative pl-8 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#6e45e2]/80 to-[#6e45e2]/20 rounded-full" />

            {timeline.map((commit) => (
              <div key={commit.commit} className="relative">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute left-[-8px] top-1.5 w-4 h-4 rounded-full border-2 border-background",
                    commit.isCurrent ? "bg-[#6e45e2]" : "bg-muted-foreground/70"
                  )}
                >
                  {commit.isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6e45e2] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#6e45e2]"></span>
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    "rounded-lg border transition-all duration-200 overflow-hidden",
                    commit.isCurrent
                      ? "border-[#6e45e2]/30 shadow-sm bg-[#6e45e2]/5"
                      : "border-border/40 hover:border-[#6e45e2]/20"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={commit.isCurrent ? "default" : "outline"}
                          className={
                            commit.isCurrent
                              ? "bg-[#6e45e2] hover:bg-[#5d3ac9] text-white"
                              : "text-muted-foreground"
                          }
                        >
                          {commit.isCurrent ? "Current" : "Historical"}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <GitCommit className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono">{commit.commit}</span>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {commit.action}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(commit.commitTime)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-[#6e45e2]/5 rounded-md p-3">
                        <div className="text-xs text-muted-foreground">
                          Records Written
                        </div>
                        <div className="font-semibold text-[#6e45e2]">
                          {commit.recordsWritten.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#6e45e2]/5 rounded-md p-3">
                        <div className="text-xs text-muted-foreground">
                          Records Updated
                        </div>
                        <div className="font-semibold text-[#6e45e2]">
                          {commit.recordsUpdated.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#6e45e2]/5 rounded-md p-3">
                        <div className="text-xs text-muted-foreground">
                          Records Deleted
                        </div>
                        <div className="font-semibold text-[#6e45e2]">
                          {commit.recordsDeleted.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewCommitDetails(commit)}
                        className="text-[#6e45e2] hover:text-[#5d3ac9] hover:bg-[#6e45e2]/10 border-[#6e45e2]/30"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commit Details Dialog */}
      <Dialog
        open={!!selectedCommit}
        onOpenChange={(open) => !open && setSelectedCommit(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#6e45e2]">
              <GitCommit className="h-5 w-5" />
              Commit Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedCommit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Commit Time
                    </div>
                    <div className="font-medium">
                      {formatDate(selectedCommit.commitTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Commit Hash
                    </div>
                    <div className="font-mono text-sm">
                      {selectedCommit.commit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Action</div>
                    <div>
                      <Badge
                        variant="outline"
                        className="capitalize bg-[#6e45e2]/10 text-[#6e45e2] border-[#6e45e2]/20"
                      >
                        {selectedCommit.action}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>
                      <Badge
                        variant={
                          selectedCommit.isCurrent ? "default" : "outline"
                        }
                        className={
                          selectedCommit.isCurrent
                            ? "bg-[#6e45e2] hover:bg-[#5d3ac9] text-white"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedCommit.isCurrent ? "Current" : "Historical"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Records Summary</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#6e45e2]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Written
                      </div>
                      <div className="font-semibold text-[#6e45e2]">
                        {selectedCommit.recordsWritten.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#6e45e2]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Updated
                      </div>
                      <div className="font-semibold text-[#6e45e2]">
                        {selectedCommit.recordsUpdated.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#6e45e2]/5 rounded p-2">
                      <div className="text-xs text-muted-foreground">
                        Deleted
                      </div>
                      <div className="font-semibold text-[#6e45e2]">
                        {selectedCommit.recordsDeleted.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">File Operations</h4>
                  <div className="rounded-md border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>File Type</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>Size</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCommit.fileStats && (
                          <>
                            <TableRow>
                              <TableCell>Base Files</TableCell>
                              <TableCell>
                                {selectedCommit.fileStats.baseFiles}
                              </TableCell>
                              <TableCell>
                                {Math.round(
                                  Number.parseInt(
                                    selectedCommit.fileStats.totalSize
                                  ) * 0.75
                                )}
                                MB
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Log Files</TableCell>
                              <TableCell>
                                {selectedCommit.fileStats.logFiles}
                              </TableCell>
                              <TableCell>
                                {Math.round(
                                  Number.parseInt(
                                    selectedCommit.fileStats.totalSize
                                  ) * 0.25
                                )}
                                MB
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Total</TableCell>
                              <TableCell>
                                {selectedCommit.fileStats.baseFiles +
                                  selectedCommit.fileStats.logFiles}
                              </TableCell>
                              <TableCell>
                                {selectedCommit.fileStats.totalSize}
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Commit Metadata</h4>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(
                        {
                          commitTime: selectedCommit.commitTime,
                          commitHash: selectedCommit.commit,
                          operation: selectedCommit.action,
                          partitionPath: "default",
                          fileSize: selectedCommit.fileStats?.totalSize,
                          baseFileSize: selectedCommit.fileStats
                            ? `${Math.round(Number.parseInt(selectedCommit.fileStats.totalSize) * 0.75)}MB`
                            : "0MB",
                          logFileSize: selectedCommit.fileStats
                            ? `${Math.round(Number.parseInt(selectedCommit.fileStats.totalSize) * 0.25)}MB`
                            : "0MB",
                          totalRecords: selectedCommit.recordsWritten,
                          totalUpdateRecords: selectedCommit.recordsUpdated,
                          totalDeleteRecords: selectedCommit.recordsDeleted,
                          hoodie: {
                            commit: {
                              schema: "hudi_1.0",
                              hoodieTableVersion: 5,
                              hoodieTableType:
                                metadata?.tableType || "COPY_ON_WRITE",
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
              onClick={() => setSelectedCommit(null)}
              className="border-[#6e45e2]/30 text-[#6e45e2] hover:bg-[#6e45e2]/10"
            >
              Close
            </Button>
            <Button
              variant="default"
              className="bg-[#6e45e2] hover:bg-[#5d3ac9]"
            >
              Restore This Version
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
