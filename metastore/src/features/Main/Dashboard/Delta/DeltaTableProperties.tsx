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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileJson, Settings } from "lucide-react";

// Define interfaces for type safety
interface DeltaTableMetadata {
  tableId?: string;
  formatVersion?: string;
  location?: string;
  createdAt?: number;
  lastModified?: number;
  name?: string;
  description?: string;
  owner?: string;
  format?: {
    provider: string;
    options: Record<string, string>;
  };
  schema?: {
    fields: any[];
  };
  partitionColumns?: string[];
  properties?: Record<string, string>;
}

interface DeltaTablePropertiesProps {
  metadata: DeltaTableMetadata;
}

export function DeltaTableProperties({ metadata }: DeltaTablePropertiesProps) {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  // Get Delta properties from metadata or use defaults
  const deltaProperties: Record<string, string> = metadata.properties || {};

  return (
    <div className="space-y-6">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="format" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Format Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <span className="bg-[#20a7b6]/10 text-[#20a7b6] p-1 rounded">
                      <Settings className="h-5 w-5" />
                    </span>
                    Delta Table Properties
                  </CardTitle>
                  <CardDescription>
                    Configuration properties for{" "}
                    <Badge variant="outline">
                      {metadata?.location?.split("/").pop() || "Unknown"}
                    </Badge>
                  </CardDescription>
                </div>
                <Badge variant="secondary">DELTA</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {Object.keys(deltaProperties).length > 0 ? (
                <div className="rounded-md border border-border/40 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(deltaProperties).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium font-mono text-sm">
                            {key}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No properties available for this Delta table.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#20a7b6]/10 text-[#20a7b6] p-1 rounded">
                  <FileJson className="h-5 w-5" />
                </span>
                Delta Table Metadata
              </CardTitle>
              <CardDescription>
                Core metadata for{" "}
                <Badge variant="outline">
                  {metadata?.location?.split("/").pop() || "Unknown"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Attribute</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Table ID</TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata?.tableId || "unknown"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Format Version
                      </TableCell>
                      <TableCell>{metadata?.formatVersion || "1"}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Location</TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata?.location || "unknown"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Created At</TableCell>
                      <TableCell>
                        {formatTimestamp(metadata?.createdAt || 0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Last Modified
                      </TableCell>
                      <TableCell>
                        {formatTimestamp(metadata?.lastModified || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="format" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#20a7b6]/10 text-[#20a7b6] p-1 rounded">
                  <Database className="h-5 w-5" />
                </span>
                Delta Format Details
              </CardTitle>
              <CardDescription>
                Format-specific details for{" "}
                <Badge variant="outline">
                  {metadata?.location?.split("/").pop() || "Unknown"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Format Information</h3>
                  <div className="rounded-md border border-border/40 overflow-hidden">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Format Type
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-[#20a7b6]/10 text-[#20a7b6] hover:bg-[#20a7b6]/20 border-[#20a7b6]/30">
                              DELTA
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Storage Format
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {metadata?.format?.provider?.toUpperCase() ||
                                "PARQUET"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Compression
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {metadata?.format?.options?.compression?.toUpperCase() ||
                                "SNAPPY"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Delta Features</h3>
                  <div className="rounded-md border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Time Travel</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">
                              Enabled
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Change Data Feed</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                deltaProperties[
                                  "delta.enableChangeDataFeed"
                                ] === "true"
                                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none"
                                  : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none"
                              }
                            >
                              {deltaProperties["delta.enableChangeDataFeed"] ===
                              "true"
                                ? "Enabled"
                                : "Disabled"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>ACID Transactions</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">
                              Enabled
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Schema Evolution</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">
                              Enabled
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
