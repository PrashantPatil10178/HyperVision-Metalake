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

interface SchemaViewerProps {
  metadata: any;
}

export function SchemaViewer({ metadata }: SchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Extract schema fields from metadata
  const fields = metadata.schemas[0]?.fields || [];

  // Filter fields based on search term
  const filteredFields = fields.filter(
    (field: any) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/40 shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary/10 text-primary p-1 rounded">
              <TableIcon className="h-5 w-5" />
            </span>
            Table Schema
          </CardTitle>
          <CardDescription>
            Viewing schema for{" "}
            <Badge variant="outline">
              {metadata?.location?.split("/").pop() || "Unknown"}
            </Badge>
          </CardDescription>
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

          <div className="rounded-md border border-border/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead className="text-center">Required</TableHead>
                  <TableHead className="text-center">Partition Key</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFields.length > 0 ? (
                  filteredFields.map((field: any) => {
                    // Check if this field is used as a partition key
                    const isPartitionKey = metadata[
                      "partition-specs"
                    ]?.[0]?.fields?.some(
                      (partField: any) => partField["source-id"] === field.id
                    );

                    return (
                      <TableRow key={field.id}>
                        <TableCell className="font-mono">{field.id}</TableCell>
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
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isPartitionKey ? (
                            <Badge className="bg-[oklch(0.9_0.1_140)] text-[oklch(0.3_0.1_140)] hover:bg-[oklch(0.85_0.1_140)] border-none">
                              Partition Key
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
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

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredFields.length} of {fields.length} columns
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
