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

interface HudiSchemaViewerProps {
  metadata: {
    tableName?: string;
    tableType?: string;
    version?: string;
    location?: string;
    lastUpdated?: number;
  };
}

export function HudiSchemaViewer({ metadata }: HudiSchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock Hudi schema data
  const fields = [
    {
      id: 1,
      name: "_hoodie_commit_time",
      type: "string",
      required: true,
      doc: "Commit timestamp",
    },
    {
      id: 2,
      name: "_hoodie_record_key",
      type: "string",
      required: true,
      doc: "Record key",
    },
    {
      id: 3,
      name: "_hoodie_partition_path",
      type: "string",
      required: false,
      doc: "Partition path",
    },
    { id: 4, name: "id", type: "long", required: true, doc: "Primary key" },
    {
      id: 5,
      name: "name",
      type: "string",
      required: false,
      doc: "Customer name",
    },
    {
      id: 6,
      name: "email",
      type: "string",
      required: false,
      doc: "Email address",
    },
    {
      id: 7,
      name: "created_at",
      type: "timestamp",
      required: false,
      doc: "Creation time",
    },
  ];

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
                <span className="bg-[#6e45e2]/10 text-[#6e45e2] p-1 rounded">
                  <TableIcon className="h-5 w-5" />
                </span>
                Hudi Table Schema
              </CardTitle>
              <CardDescription>
                Viewing schema for{" "}
                <Badge variant="outline">
                  {metadata?.tableName || "Unknown"}
                </Badge>
              </CardDescription>
            </div>
            <Badge variant="secondary">HUDI</Badge>
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
              <TabsTrigger value="metadata">Hudi Metadata</TabsTrigger>
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
                              <Badge className="bg-[#6e45e2]/20 text-[#6e45e2] hover:bg-[#6e45e2]/30 border-none">
                                Yes
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {field.doc || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
                  <h4 className="font-medium">Hudi Partitioning</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#6e45e2]/5 p-4 rounded-md border border-[#6e45e2]/20">
                      <div className="text-sm text-muted-foreground">
                        Partition Field
                      </div>
                      <div className="font-medium">_hoodie_partition_path</div>
                    </div>
                    <div className="bg-[#6e45e2]/5 p-4 rounded-md border border-[#6e45e2]/20">
                      <div className="text-sm text-muted-foreground">
                        Partition Strategy
                      </div>
                      <div className="font-medium">Hive Style</div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-md">
                    <pre className="font-mono text-xs">
                      {`// Example partition paths
year=2023/month=11/day=15
region=us/category=electronics
`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metadata">
              <div className="rounded-md border border-border/40 p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Hudi Metadata Columns</h4>
                  <div className="rounded-md border border-[#6e45e2]/20 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[#6e45e2]/10">
                        <TableRow>
                          <TableHead>Column</TableHead>
                          <TableHead>Purpose</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono">
                            _hoodie_commit_time
                          </TableCell>
                          <TableCell>Timestamp of the commit</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">
                            _hoodie_record_key
                          </TableCell>
                          <TableCell>Unique record identifier</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">
                            _hoodie_partition_path
                          </TableCell>
                          <TableCell>Partition path for the record</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-mono">
                            _hoodie_file_name
                          </TableCell>
                          <TableCell>Source file of the record</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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
