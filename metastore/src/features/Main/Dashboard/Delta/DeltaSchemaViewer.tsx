"use client";

import { useState } from "react";
import { Search, TableIcon } from "lucide-react";
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

// Define interfaces for type safety
interface DeltaTableField {
  id: number;
  name: string;
  type: string;
  required: boolean;
  doc?: string;
}

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
    fields: DeltaTableField[];
  };
  partitionColumns?: string[];
  properties?: Record<string, string>;
}

interface DeltaSchemaViewerProps {
  metadata: DeltaTableMetadata;
}

export function DeltaSchemaViewer({ metadata }: DeltaSchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Get fields from metadata or use empty array if not available
  const fields: DeltaTableField[] = metadata.schema?.fields || [];

  // Get partition columns from metadata or use empty array if not available
  const partitionColumns: string[] = metadata.partitionColumns || [];

  // Filter fields based on search term
  const filteredFields = fields.filter(
    (field) =>
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
                <span className="bg-[#20a7b6]/10 text-[#20a7b6] p-1 rounded">
                  <TableIcon className="h-5 w-5" />
                </span>
                Delta Table Schema
              </CardTitle>
              <CardDescription>
                Viewing schema for{" "}
                <Badge variant="outline">
                  {metadata?.location?.split("/").pop() || "Unknown"}
                </Badge>
              </CardDescription>
            </div>
            <Badge variant="secondary">DELTA</Badge>
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
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
            </TabsList>

            <TabsContent value="columns">
              <div className="rounded-md border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Column Name</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead className="text-center">Required</TableHead>
                      <TableHead className="text-center">
                        Partition Key
                      </TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-mono">
                            {field.id}
                          </TableCell>
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
                          <TableCell className="text-center">
                            {field.required ? (
                              <Badge className="bg-[#20a7b6]/20 text-[#20a7b6] hover:bg-[#20a7b6]/30 border-none">
                                Yes
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {partitionColumns.includes(field.name) ? (
                              <Badge className="bg-[#20a7b6]/10 text-[#20a7b6] hover:bg-[#20a7b6]/20 border-[#20a7b6]/30">
                                Partition Key
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {field.doc || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
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
                  <h4 className="font-medium">Delta Partition Columns</h4>
                  {partitionColumns.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {partitionColumns.map((col) => (
                          <Badge
                            key={col}
                            variant="outline"
                            className="bg-[#20a7b6]/10 text-[#20a7b6] border-[#20a7b6]/30"
                          >
                            {col}
                          </Badge>
                        ))}
                      </div>
                      <div className="bg-muted/30 p-4 rounded-md">
                        <pre className="font-mono text-xs">
                          {`-- Partitioning strategy
PARTITIONED BY (${partitionColumns.join(", ")})
`}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      This table is not partitioned.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="constraints">
              <div className="rounded-md border border-border/40 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Delta Constraints</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#20a7b6]/5 p-4 rounded-md border border-[#20a7b6]/20">
                      <div className="text-sm text-muted-foreground">
                        Not Null Constraints
                      </div>
                      <div className="font-medium mt-2">
                        {fields.filter((f) => f.required).length > 0 ? (
                          fields
                            .filter((f) => f.required)
                            .map((f) => (
                              <Badge
                                key={f.id}
                                variant="outline"
                                className="mr-2"
                              >
                                {f.name}
                              </Badge>
                            ))
                        ) : (
                          <span className="text-muted-foreground">
                            None defined
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#20a7b6]/5 p-4 rounded-md border border-[#20a7b6]/20">
                      <div className="text-sm text-muted-foreground">
                        Check Constraints
                      </div>
                      <div className="font-medium mt-2">
                        <span className="text-muted-foreground">
                          None defined
                        </span>
                      </div>
                    </div>
                  </div>
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
