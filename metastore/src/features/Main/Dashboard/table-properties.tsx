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

interface TablePropertiesProps {
  metadata: any;
}

export function TableProperties({ metadata }: TablePropertiesProps) {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
            Format Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded">
                  <Settings className="h-5 w-5" />
                </span>
                Table Properties
              </CardTitle>
              <CardDescription>
                Configuration properties for <Badge variant="outline">{}</Badge>
              </CardDescription>
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
                    {Object.entries(metadata.properties || {}).map(
                      ([key, value]: [string, any]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium font-mono text-sm">
                            {key}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {value}
                          </TableCell>
                        </TableRow>
                      )
                    )}
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
                <span className="bg-primary/10 text-primary p-1 rounded">
                  <FileJson className="h-5 w-5" />
                </span>
                Table Metadata
              </CardTitle>
              <CardDescription>
                Core metadata for{" "}
                <Badge variant="outline">
                  {metadata.location.split("/").pop()}
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
                      <TableCell className="font-medium">
                        Format Version
                      </TableCell>
                      <TableCell>{metadata["format-version"]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Table UUID</TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata["table-uuid"]}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Location</TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata.location}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Last Updated
                      </TableCell>
                      <TableCell>
                        {formatTimestamp(metadata["last-updated-ms"])}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Last Sequence Number
                      </TableCell>
                      <TableCell>{metadata["last-sequence-number"]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Current Schema ID
                      </TableCell>
                      <TableCell>{metadata["current-schema-id"]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Current Snapshot ID
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {metadata["current-snapshot-id"]}
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
                <span className="bg-primary/10 text-primary p-1 rounded">
                  <Database className="h-5 w-5" />
                </span>
                Format Details
              </CardTitle>
              <CardDescription>
                Format-specific details for{" "}
                <Badge variant="outline">
                  {metadata.location.split("/").pop()}
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
                            <Badge className="bg-[oklch(0.9_0.1_280)] text-[oklch(0.3_0.1_280)] hover:bg-[oklch(0.85_0.1_280)] border-none">
                              Iceberg
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
                        <TableRow>
                          <TableCell className="font-medium">
                            Compression
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {metadata.properties[
                                "write.parquet.compression-codec"
                              ] || "None"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sort Orders</h3>
                  <div className="rounded-md border border-border/40 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Fields</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metadata["sort-orders"]?.map(
                          (order: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{order["order-id"]}</TableCell>
                              <TableCell>
                                {order.fields.length > 0 ? (
                                  order.fields.map((field: any, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="mr-1"
                                    >
                                      {field.name}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground">
                                    No sort fields defined
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
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
