"use client";

import { useState } from "react";
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
import { Layers, RefreshCw, Play, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HudiCompactionViewProps {
  metadata: {
    tableName?: string;
    tableType?: string;
    version?: string;
    location?: string;
    lastUpdated?: number;
    compactionStatus?: {
      lastCompactionTime?: number;
      pendingCompactions?: number;
      totalCompactions?: number;
    };
  };
}

export function HudiCompactionView({ metadata }: HudiCompactionViewProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [compactionHistory] = useState([
    {
      id: "comp-001",
      startTime: Date.now() - 86400000 * 3, // 3 days ago
      endTime: Date.now() - 86400000 * 3 + 3600000, // 1 hour after start
      status: "completed",
      filesCompacted: 24,
      sizeReduced: "120MB",
      duration: "58 minutes",
    },
    {
      id: "comp-002",
      startTime: Date.now() - 86400000 * 7, // 7 days ago
      endTime: Date.now() - 86400000 * 7 + 4200000, // 70 minutes after start
      status: "completed",
      filesCompacted: 36,
      sizeReduced: "210MB",
      duration: "70 minutes",
    },
  ]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const scheduleCompaction = () => {
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <Layers className="h-5 w-5" />
                </span>
                Hudi Compaction
              </CardTitle>
              <CardDescription>
                Manage compaction for{" "}
                <Badge variant="outline">
                  {metadata?.tableName || "Unknown"}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Compaction Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#6e45e2]/5 p-4 rounded-md border border-[#6e45e2]/20">
                  <div className="text-sm text-muted-foreground">
                    Last Compaction
                  </div>
                  <div className="font-medium">
                    {metadata?.compactionStatus?.lastCompactionTime
                      ? formatDate(metadata.compactionStatus.lastCompactionTime)
                      : "Never"}
                  </div>
                </div>
                <div className="bg-[#6e45e2]/5 p-4 rounded-md border border-[#6e45e2]/20">
                  <div className="text-sm text-muted-foreground">
                    Pending Compactions
                  </div>
                  <div className="font-medium">
                    {metadata?.compactionStatus?.pendingCompactions || 0}
                  </div>
                </div>
              </div>
              <div className="bg-[#6e45e2]/5 p-4 rounded-md border border-[#6e45e2]/20">
                <div className="flex justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    Compaction Health
                  </div>
                  <div className="text-sm font-medium text-green-600">Good</div>
                </div>
                <Progress value={75} className="h-2 bg-[#6e45e2]/20" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule Compaction</h3>
              <div className="bg-muted/30 p-4 rounded-md border">
                <p className="text-sm text-muted-foreground mb-4">
                  Compaction optimizes the storage of your Hudi table by
                  combining small files and cleaning up deleted records.
                </p>
                <Button
                  className="bg-[#6e45e2] hover:bg-[#5d3ac9] text-white w-full"
                  onClick={scheduleCompaction}
                  disabled={isScheduling}
                >
                  {isScheduling ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Schedule New Compaction
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Compaction History</h3>
            <div className="rounded-md border border-border/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files Compacted</TableHead>
                    <TableHead>Size Reduced</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compactionHistory.map((compaction) => (
                    <TableRow key={compaction.id}>
                      <TableCell className="font-mono text-xs">
                        {compaction.id}
                      </TableCell>
                      <TableCell>{formatDate(compaction.startTime)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {compaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{compaction.filesCompacted}</TableCell>
                      <TableCell>{compaction.sizeReduced}</TableCell>
                      <TableCell>{compaction.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
