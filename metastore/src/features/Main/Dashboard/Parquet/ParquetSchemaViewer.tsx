"use client";

import { useState } from "react";
import { Search, Table as TableIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParquetSchemaViewerProps {
  metadata: any;
}

export function ParquetSchemaViewer({ metadata }: ParquetSchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const fields = metadata?.schema?.fields || [];

  const filteredFields = fields.filter(
    (field: any) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <TableIcon className="h-5 w-5" />
                </span>
                Parquet Table Schema
              </CardTitle>
              <CardDescription>
                Viewing schema for{" "}
                <Badge variant="outline">
                  {metadata?.table_name || "Unknown"}
                </Badge>
              </CardDescription>
            </div>
            <Badge variant="secondary">PARQUET</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search columns..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs defaultValue="columns" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger value="partitioning">Partitioning</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="columns">
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Column Name</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Nullable</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field: any) => (
                        <TableRow key={field.name}>
                          <TableCell className="font-medium">
                            {field.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="font-mono bg-background"
                            >
                              {field.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {field.nullable ? (
                              <Badge className="bg-[#6e45e2]/20 text-[#6e45e2] hover:bg-[#6e45e2]/30 border-none">
                                Yes
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No columns found matching your search.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="partitioning">
              <div className="rounded-md border border-border/40 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Parquet Partitioning</h4>
                  {metadata?.partitions?.[0]?.partition_values ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(
                          metadata.partitions[0].partition_values
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-[#6e45e2]/5 p-4 rounded-md border border-[#6e45e2]/20"
                          >
                            <div className="text-sm text-muted-foreground">
                              Partition Field
                            </div>
                            <div className="font-medium">{key}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Sample Value
                            </div>
                            <div className="font-mono text-sm">
                              {String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-muted/30 p-4 rounded-md">
                        <pre className="font-mono text-xs">
                          {`// Example partition paths\n`}
                          {metadata.partitions.slice(0, 3).map(
                            (p: any) =>
                              Object.entries(p.partition_values)
                                .map(([k, v]) => `${k}=${v}`)
                                .join("/") + "\n"
                          )}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      This table is not partitioned
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics">
              <div className="rounded-md border border-border/40 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Column Statistics</h4>
                  {metadata?.partitions?.[0]?.column_statistics ? (
                    <div className="rounded-md border border-[#6e45e2]/20 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-[#6e45e2]/10">
                          <TableRow>
                            <TableHead>Column</TableHead>
                            <TableHead>Min</TableHead>
                            <TableHead>Max</TableHead>
                            <TableHead>Null Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(
                            metadata.partitions[0].column_statistics
                          ).map(([name, stats]: [string, any]) => (
                            <TableRow key={name}>
                              <TableCell className="font-mono">
                                {name}
                              </TableCell>
                              <TableCell>{stats.min ?? "N/A"}</TableCell>
                              <TableCell>{stats.max ?? "N/A"}</TableCell>
                              <TableCell>{stats.null_count ?? "0"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No column statistics available
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredFields.length} of {fields.length} columns
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
