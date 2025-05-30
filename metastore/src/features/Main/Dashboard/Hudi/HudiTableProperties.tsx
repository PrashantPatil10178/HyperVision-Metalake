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

interface HudiTablePropertiesProps {
  metadata: {
    tableName?: string;
    tableType?: string;
    version?: string;
    location?: string;
    lastUpdated?: number;
  };
}

export function HudiTableProperties({ metadata }: HudiTablePropertiesProps) {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Mock Hudi properties
  const hudiProperties = {
    "hoodie.table.name": metadata?.tableName || "hudi_table",
    "hoodie.table.type": metadata?.tableType || "COPY_ON_WRITE",
    "hoodie.table.version": metadata?.version || "5",
    "hoodie.base.path": metadata?.location || "",
    "hoodie.cleaner.commits.retained": "10",
    "hoodie.compact.inline": "true",
    "hoodie.compact.inline.max.delta.commits": "5",
  };

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
            Hudi Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                      <Settings className="h-5 w-5" />
                    </span>
                    Hudi Table Properties
                  </CardTitle>
                  <CardDescription>
                    Configuration properties for{" "}
                    <Badge variant="outline">
                      {metadata?.tableName || "Unknown"}
                    </Badge>
                  </CardDescription>
                </div>
                <Badge variant="secondary">HUDI</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(hudiProperties).map(([key, value]) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <FileJson className="h-5 w-5" />
                </span>
                Hudi Table Metadata
              </CardTitle>
              <CardDescription>
                Core metadata for{" "}
                <Badge variant="outline">
                  {metadata?.tableName || "Unknown"}
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
                      <TableCell className="font-medium">Table Name</TableCell>
                      <TableCell>{metadata?.tableName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Table Type</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {metadata?.tableType || "COPY_ON_WRITE"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Base Path</TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata?.location}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Last Updated
                      </TableCell>
                      <TableCell>
                        {formatTimestamp(metadata?.lastUpdated || Date.now())}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Version</TableCell>
                      <TableCell>{metadata?.version || "5"}</TableCell>
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
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <Database className="h-5 w-5" />
                </span>
                Hudi Format Details
              </CardTitle>
              <CardDescription>
                Hudi-specific details for{" "}
                <Badge variant="outline">
                  {metadata?.tableName || "Unknown"}
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
                            <Badge className="bg-[#6e45e2]/10 text-[#6e45e2] hover:bg-[#6e45e2]/20 border-[#6e45e2]/30">
                              HUDI
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Table Type
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {metadata?.tableType || "COPY_ON_WRITE"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Storage Format
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Parquet</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Hudi Features</h3>
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
                          <TableCell>Upserts</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">
                              Enabled
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Incremental Processing</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">
                              Enabled
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Time Travel</TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">
                              Enabled
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Compaction</TableCell>
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
