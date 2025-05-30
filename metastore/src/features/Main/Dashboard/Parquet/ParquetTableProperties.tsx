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

interface ParquetTablePropertiesProps {
  metadata: any;
}

export function ParquetTableProperties({
  metadata,
}: ParquetTablePropertiesProps) {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const parquetProperties = {
    "parquet.table.name": metadata?.table_name || "parquet_table",
    "parquet.version": "2.6.0",
    "parquet.location": metadata?.s3_location || "",
    "parquet.row.count": metadata?.total_rows?.toLocaleString() || "0",
    "parquet.file.count": metadata?.total_files?.toLocaleString() || "0",
    "parquet.compression": metadata?.partitions?.[0]?.compression || "SNAPPY",
    "parquet.partition.columns": metadata?.partitions?.[0]?.partition_values
      ? Object.keys(metadata.partitions[0].partition_values).join(", ")
      : "None",
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
            Parquet Details
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
                    Parquet Table Properties
                  </CardTitle>
                  <CardDescription>
                    Configuration properties for{" "}
                    <Badge variant="outline">
                      {metadata?.table_name || "Unknown"}
                    </Badge>
                  </CardDescription>
                </div>
                <Badge variant="secondary">PARQUET</Badge>
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
                    {Object.entries(parquetProperties).map(([key, value]) => (
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
                Parquet Table Metadata
              </CardTitle>
              <CardDescription>
                Core metadata for{" "}
                <Badge variant="outline">
                  {metadata?.table_name || "Unknown"}
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
                      <TableCell>{metadata?.table_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Location</TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata?.s3_location}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Last Updated
                      </TableCell>
                      <TableCell>
                        {metadata?.last_updated
                          ? formatTimestamp(metadata.last_updated)
                          : "Unknown"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Rows</TableCell>
                      <TableCell>
                        {metadata?.total_rows?.toLocaleString() || "0"}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Files</TableCell>
                      <TableCell>
                        {metadata?.total_files?.toLocaleString() || "0"}
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
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <Database className="h-5 w-5" />
                </span>
                Parquet Format Details
              </CardTitle>
              <CardDescription>
                Parquet-specific details for{" "}
                <Badge variant="outline">
                  {metadata?.table_name || "Unknown"}
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
                              PARQUET
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Compression
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {metadata?.partitions?.[0]?.compression ||
                                "SNAPPY"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Row Groups
                          </TableCell>
                          <TableCell>
                            {metadata?.partitions?.[0]?.num_row_groups || "1"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Partitioning</h3>
                  <div className="rounded-md border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Partition Column</TableHead>
                          <TableHead>Values</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metadata?.partitions?.[0]?.partition_values ? (
                          Object.entries(
                            metadata.partitions[0].partition_values
                          ).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell>{key}</TableCell>
                              <TableCell>{String(value)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="text-center text-muted-foreground"
                            >
                              No partitioning
                            </TableCell>
                          </TableRow>
                        )}
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
