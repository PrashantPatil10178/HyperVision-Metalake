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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Clock,
  ChevronDown,
  ChevronRight,
  Calendar,
  FileText,
  Database,
  Hash,
  FileJson,
  ExternalLink,
  Info,
  Code,
  List,
  Table2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import api from "@/services/AxiosInterceptor";

interface PartitionDetailsProps {
  metadata: any;
}

export function PartitionDetails({ metadata }: PartitionDetailsProps) {
  // Extract partition specs from metadata
  const partitionSpecs = metadata["partition-specs"] || [];
  const snapshots = metadata.snapshots || [];

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-[#1E88E5]/10 text-[#1E88E5] p-1 rounded">
              <Layers className="h-5 w-5" />
            </span>
            Partition Specifications
          </CardTitle>
          <CardDescription>
            Partition details for{" "}
            <Badge variant="outline">
              {metadata.location?.split("/").pop() || "Table"}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {partitionSpecs.length > 0 ? (
            <div className="rounded-md border border-border/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Spec ID</TableHead>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Transform</TableHead>
                    <TableHead>Source Column</TableHead>
                    <TableHead>Field ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partitionSpecs.flatMap((spec: any) =>
                    spec.fields.map((field: any, index: number) => {
                      // Find the source column name
                      const sourceColumn = metadata.schemas?.[0]?.fields.find(
                        (col: any) => col.id === field["source-id"]
                      );

                      return (
                        <TableRow key={`${spec["spec-id"]}-${index}`}>
                          <TableCell>{spec["spec-id"]}</TableCell>
                          <TableCell className="font-medium">
                            {field.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {field.transform}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sourceColumn?.name ||
                              `Column ID ${field["source-id"]}`}
                          </TableCell>
                          <TableCell className="font-mono">
                            {field["field-id"]}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-border/40 p-6 text-center">
              <p className="text-muted-foreground">
                No partition specifications found for this table.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <SnapshotTimeline snapshots={snapshots} metadata={metadata} />
    </div>
  );
}

function SnapshotTimeline({
  snapshots,
  metadata,
}: {
  snapshots: any[];
  metadata: any;
}) {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <span className="bg-[#1E88E5]/10 text-[#1E88E5] p-1 rounded">
            <Clock className="h-5 w-5" />
          </span>
          Snapshot Timeline
        </CardTitle>
        <CardDescription>
          History of table snapshots with{" "}
          <Badge variant="outline">
            {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {snapshots.length > 0 ? (
          <div className="relative pl-8 space-y-2">
            {/* Timeline line */}
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#1E88E5]/80 to-[#1E88E5]/20 rounded-full" />

            {snapshots.map((snapshot, index) => (
              <SnapshotItem
                key={snapshot["snapshot-id"]}
                snapshot={snapshot}
                isLatest={index === 0}
                metadata={metadata}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border/40 p-6 text-center">
            <p className="text-muted-foreground">
              No snapshots found for this table.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SnapshotItem({
  snapshot,
  isLatest,
  metadata,
}: {
  snapshot: any;
  isLatest: boolean;
  metadata: any;
}) {
  const [expanded, setExpanded] = useState(isLatest);
  const [manifestDetails, setManifestDetails] = useState<any>(null);
  const [showManifestModal, setShowManifestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Format timestamp to readable date
  const timestamp = new Date(snapshot["timestamp-ms"]);
  const formattedDate = timestamp.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = timestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Get summary data
  const summary = snapshot.summary || {};
  const operation = summary.operation || "unknown";

  const snapshots = metadata.snapshots || [];

  // Mock API call to get manifest details
  const fetchManifestDetails = async (url: string) => {
    console.log(url);
    setIsLoading(true);

    const response = await api.post("ice-burg/parse", {
      url,
    });
    console.log(response.data);
    setManifestDetails(response.data);
    setIsLoading(false);
    setShowManifestModal(true);
  };

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div
        className={cn(
          "absolute left-[-8px] top-1.5 w-4 h-4 rounded-full border-2 border-background",
          isLatest ? "bg-[#1E88E5]" : "bg-muted-foreground/70"
        )}
      >
        {isLatest && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E88E5] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1E88E5]"></span>
          </span>
        )}
      </div>

      <div
        className={cn(
          "rounded-lg border transition-all duration-200 overflow-hidden",
          expanded
            ? "border-[#1E88E5]/30 shadow-sm"
            : "border-border/40 hover:border-[#1E88E5]/20",
          isLatest ? "bg-[#1E88E5]/5" : ""
        )}
      >
        <div
          className="p-3 flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-2">
            <Badge
              variant={isLatest ? "default" : "outline"}
              className={
                isLatest
                  ? "bg-[#1E88E5] hover:bg-[#1976D2] text-white"
                  : "text-muted-foreground"
              }
            >
              {isLatest
                ? "Latest"
                : `Snapshot ${snapshots.indexOf(snapshot) + 1}`}
            </Badge>
            <span className="text-sm font-medium">{operation}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate} {formattedTime}
            </div>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-3 pb-3 pt-1 border-t border-border/40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#1E88E5]/10 rounded-md p-3 flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1E88E5]" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Data Files
                      </div>
                      <div className="font-semibold">
                        {summary["total-data-files"] || 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E88E5]/10 rounded-md p-3 flex items-center gap-3">
                    <Database className="h-5 w-5 text-[#1E88E5]" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Records
                      </div>
                      <div className="font-semibold">
                        {summary["total-records"] || 0}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E88E5]/10 rounded-md p-3 flex items-center gap-3">
                    <Hash className="h-5 w-5 text-[#1E88E5]" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Snapshot ID
                      </div>
                      <div className="font-mono text-xs truncate max-w-[150px]">
                        {snapshot["snapshot-id"]}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(summary).map(([key, value]) => (
                      <div key={key} className="bg-muted/30 rounded p-2">
                        <div className="text-xs text-muted-foreground">
                          {key}
                        </div>
                        <div className="font-mono text-xs truncate">
                          {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {snapshot["manifest-list"] && (
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Manifest List
                          </div>
                          <div className="font-mono text-xs break-all">
                            {snapshot["manifest-list"]}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 flex items-center gap-1 text-[#1E88E5] hover:text-[#1976D2] hover:bg-[#1E88E5]/10 border-[#1E88E5]/30"
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchManifestDetails(snapshot["manifest-list"]);
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="h-4 w-4 border-2 border-[#1E88E5]/30 border-t-[#1E88E5] rounded-full animate-spin mr-1"></div>
                          ) : (
                            <FileJson className="h-4 w-4" />
                          )}
                          <span>
                            {isLoading ? "Loading..." : "View Details"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manifest Details Modal */}
      <Dialog open={showManifestModal} onOpenChange={setShowManifestModal}>
        <DialogContent className="max-w-[180vw] w-full max-h-[97vh] h-full flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-[#1E88E5]">
              <FileJson className="h-5 w-5" />
              Manifest Details
            </DialogTitle>
            <DialogDescription>
              Details for manifest:{" "}
              {snapshot["manifest-list"]?.split("/").pop()}
            </DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="overview"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <div className="px-6 py-3 border-b">
              <TabsList className="bg-[#1E88E5]/10 p-1 h-auto">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white px-3 py-1.5 text-sm"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="schema"
                  className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white px-3 py-1.5 text-sm"
                >
                  <Table2 className="h-4 w-4 mr-2" />
                  Schema
                </TabsTrigger>
                <TabsTrigger
                  value="records"
                  className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white px-3 py-1.5 text-sm"
                >
                  <List className="h-4 w-4 mr-2" />
                  Records
                </TabsTrigger>
                <TabsTrigger
                  value="raw"
                  className="data-[state=active]:bg-[#1E88E5] data-[state=active]:text-white px-3 py-1.5 text-sm"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Raw JSON
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 p-6">
              <TabsContent value="overview" className="m-0">
                {manifestDetails ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2 text-[#1E88E5]">
                        <Info className="h-5 w-5" />
                        Metadata Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#1E88E5]/5 rounded-md p-4 border border-[#1E88E5]/20">
                          <div className="text-sm font-medium text-[#1E88E5] mb-1">
                            Codec
                          </div>
                          <div className="font-mono text-sm">
                            {manifestDetails.metadata.codec}
                          </div>
                        </div>
                        <div className="bg-[#1E88E5]/5 rounded-md p-4 border border-[#1E88E5]/20">
                          <div className="text-sm font-medium text-[#1E88E5] mb-1">
                            Sync Marker
                          </div>
                          <div className="font-mono text-sm">
                            {manifestDetails.metadata.sync_marker}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2 text-[#1E88E5]">
                        <Database className="h-5 w-5" />
                        Records Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-[#1E88E5]/5 rounded-md p-4 border border-[#1E88E5]/20">
                          <div className="text-sm font-medium text-[#1E88E5] mb-1">
                            Total Records
                          </div>
                          <div className="text-2xl font-bold">
                            {manifestDetails.total_records}
                          </div>
                        </div>
                        <div className="bg-[#1E88E5]/5 rounded-md p-4 border border-[#1E88E5]/20">
                          <div className="text-sm font-medium text-[#1E88E5] mb-1">
                            Added Files
                          </div>
                          <div className="text-2xl font-bold">
                            {manifestDetails.records[0].added_data_files_count}
                          </div>
                        </div>
                        <div className="bg-[#1E88E5]/5 rounded-md p-4 border border-[#1E88E5]/20">
                          <div className="text-sm font-medium text-[#1E88E5] mb-1">
                            Added Rows
                          </div>
                          <div className="text-2xl font-bold">
                            {manifestDetails.records[0].added_rows_count}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2 text-[#1E88E5]">
                        <ArrowUpDown className="h-5 w-5" />
                        Partition Bounds
                      </h3>
                      {manifestDetails.records[0].partitions &&
                      manifestDetails.records[0].partitions.length > 0 ? (
                        <div className="space-y-3">
                          {manifestDetails.records[0].partitions.map(
                            (partition: any, index: number) => (
                              <div
                                key={index}
                                className="bg-[#1E88E5]/5 rounded-md p-4 border border-[#1E88E5]/20"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <div className="text-sm font-medium text-[#1E88E5] mb-1">
                                      Lower Bound
                                    </div>
                                    <div className="font-mono text-sm bg-[#1E88E5]/10 p-2 rounded">
                                      {partition.lower_bound}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-[#1E88E5] mb-1">
                                      Upper Bound
                                    </div>
                                    <div className="font-mono text-sm bg-[#1E88E5]/10 p-2 rounded">
                                      {partition.upper_bound}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-[#1E88E5] mb-1">
                                      Contains Null
                                    </div>
                                    <Badge
                                      variant={
                                        partition.contains_null
                                          ? "destructive"
                                          : "outline"
                                      }
                                      className="bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20"
                                    >
                                      {partition.contains_null ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-[#1E88E5] mb-1">
                                      Contains NaN
                                    </div>
                                    <Badge
                                      variant={
                                        partition.contains_nan
                                          ? "destructive"
                                          : "outline"
                                      }
                                      className="bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20"
                                    >
                                      {partition.contains_nan ? "Yes" : "No"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="bg-muted/30 p-4 rounded-md text-center text-muted-foreground">
                          No partition bounds available
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-[#1E88E5]/20 h-12 w-12"></div>
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-[#1E88E5]/20 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-[#1E88E5]/20 rounded"></div>
                          <div className="h-4 bg-[#1E88E5]/20 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schema" className="m-0">
                {manifestDetails ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium flex items-center gap-2 text-[#1E88E5]">
                        <Table2 className="h-5 w-5" />
                        Schema Definition
                      </h3>
                      <Badge className="bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20">
                        {manifestDetails.schema.name} (
                        {manifestDetails.schema.type})
                      </Badge>
                    </div>

                    <div className="rounded-md border border-[#1E88E5]/20 overflow-visible h-max w-full">
                      <Table>
                        <TableHeader className="bg-[#1E88E5]/10">
                          <TableRow>
                            <TableHead className="font-semibold text-[#1E88E5]">
                              Field Name
                            </TableHead>
                            <TableHead className="font-semibold text-[#1E88E5]">
                              Type
                            </TableHead>
                            <TableHead className="font-semibold text-[#1E88E5]">
                              Field ID
                            </TableHead>
                            <TableHead className="font-semibold text-[#1E88E5]">
                              Documentation
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {manifestDetails.schema.fields.map(
                            (field: any, index: number) => (
                              <TableRow
                                key={index}
                                className={
                                  index % 2 === 0 ? "bg-[#1E88E5]/5" : ""
                                }
                              >
                                <TableCell className="font-medium">
                                  {field.name}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className="bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20"
                                  >
                                    {Array.isArray(field.type)
                                      ? `${field.type[0]} | ${field.type[1]?.type || field.type[1]}`
                                      : field.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono">
                                  {field["field-id"]}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {field.doc || "-"}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem
                          value="complex-types"
                          className="border border-[#1E88E5]/20 rounded-md overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-2 bg-[#1E88E5]/5 hover:bg-[#1E88E5]/10 text-[#1E88E5]">
                            <div className="flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              <span>Complex Type Definitions</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4">
                            <div className="bg-muted/30 p-4 rounded-md">
                              <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                                {JSON.stringify(
                                  manifestDetails.schema.fields.find(
                                    (f: any) => f.name === "partitions"
                                  )?.type,
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-[#1E88E5]/20 h-12 w-12"></div>
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-[#1E88E5]/20 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-[#1E88E5]/20 rounded"></div>
                          <div className="h-4 bg-[#1E88E5]/20 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="records" className="m-0">
                {manifestDetails ? (
                  <div className="space-y-4">
                    {manifestDetails.records.map(
                      (record: any, index: number) => (
                        <div
                          key={index}
                          className="border border-[#1E88E5]/20 rounded-md overflow-hidden"
                        >
                          <div className="bg-[#1E88E5]/10 p-3 border-b border-[#1E88E5]/20 flex items-center justify-between">
                            <h4 className="font-medium text-[#1E88E5] flex items-center gap-2">
                              <Database className="h-4 w-4" />
                              Record #{index + 1}
                            </h4>
                            <Badge className="bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20">
                              Snapshot ID: {record.added_snapshot_id}
                            </Badge>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Added Files
                                </div>
                                <div className="font-medium">
                                  {record.added_data_files_count}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Added Rows
                                </div>
                                <div className="font-medium">
                                  {record.added_rows_count}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Deleted Files
                                </div>
                                <div className="font-medium">
                                  {record.deleted_data_files_count}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Deleted Rows
                                </div>
                                <div className="font-medium">
                                  {record.deleted_rows_count}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Existing Files
                                </div>
                                <div className="font-medium">
                                  {record.existing_data_files_count}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Existing Rows
                                </div>
                                <div className="font-medium">
                                  {record.existing_rows_count}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Sequence Number
                                </div>
                                <div className="font-medium">
                                  {record.sequence_number}
                                </div>
                              </div>
                              <div className="bg-[#1E88E5]/5 p-3 rounded-md">
                                <div className="text-xs text-muted-foreground">
                                  Min Sequence Number
                                </div>
                                <div className="font-medium">
                                  {record.min_sequence_number}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Manifest Path
                                </div>
                                <div className="font-mono text-xs break-all flex items-center gap-2 bg-[#1E88E5]/5 p-2 rounded-md mt-1">
                                  {record.manifest_path}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 rounded-full text-[#1E88E5] hover:bg-[#1E88E5]/20"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Manifest Length
                                </div>
                                <div className="font-medium mt-1">
                                  {record.manifest_length.toLocaleString()}{" "}
                                  bytes
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Content Type
                                </div>
                                <div className="font-medium mt-1">
                                  <Badge className="bg-[#1E88E5]/10 text-[#1E88E5] border-[#1E88E5]/20">
                                    {record.content === 0 ? "Data" : "Deletes"}
                                  </Badge>
                                </div>
                              </div>

                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Partition Spec ID
                                </div>
                                <div className="font-medium mt-1">
                                  {record.partition_spec_id}
                                </div>
                              </div>

                              {record.partitions &&
                                record.partitions.length > 0 && (
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">
                                      Partitions
                                    </div>
                                    <div className="space-y-2">
                                      {record.partitions.map(
                                        (partition: any, pIndex: number) => (
                                          <div
                                            key={pIndex}
                                            className="bg-[#1E88E5]/5 p-3 rounded-md border border-[#1E88E5]/20"
                                          >
                                            <div className="grid grid-cols-2 gap-3">
                                              <div>
                                                <div className="text-xs text-muted-foreground">
                                                  Contains Null
                                                </div>
                                                <div className="font-medium">
                                                  {partition.contains_null
                                                    ? "Yes"
                                                    : "No"}
                                                </div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-muted-foreground">
                                                  Contains NaN
                                                </div>
                                                <div className="font-medium">
                                                  {partition.contains_nan
                                                    ? "Yes"
                                                    : "No"}
                                                </div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-muted-foreground">
                                                  Lower Bound
                                                </div>
                                                <div className="font-medium font-mono">
                                                  {partition.lower_bound}
                                                </div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-muted-foreground">
                                                  Upper Bound
                                                </div>
                                                <div className="font-medium font-mono">
                                                  {partition.upper_bound}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-[#1E88E5]/20 h-12 w-12"></div>
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-[#1E88E5]/20 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-[#1E88E5]/20 rounded"></div>
                          <div className="h-4 bg-[#1E88E5]/20 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="raw" className="m-0">
                {manifestDetails ? (
                  <div className="bg-[#1E88E5]/5 p-4 rounded-md border border-[#1E88E5]/20">
                    <ScrollArea className="h-[70vh]">
                      <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                        {JSON.stringify(manifestDetails, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-[#1E88E5]/20 h-12 w-12"></div>
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-[#1E88E5]/20 rounded w-3/4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-[#1E88E5]/20 rounded"></div>
                          <div className="h-4 bg-[#1E88E5]/20 rounded w-5/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
