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
import { FileText, GitBranch, GitCommit, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BranchGraph } from "./branch-graph";

interface VersionHistoryProps {
  metadata: any;
}

export function VersionHistory({ metadata }: VersionHistoryProps) {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="snapshots" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="snapshots" className="flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            Snapshots
          </TabsTrigger>
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Branches
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Metadata Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="snapshots" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded">
                  <GitCommit className="h-5 w-5" />
                </span>
                Snapshot History
              </CardTitle>
              <CardDescription>
                Version history for{" "}
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
                      <TableHead>Snapshot ID</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Schema ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metadata.snapshots?.map((snapshot: any, index: number) => (
                      <TableRow
                        key={index}
                        className={
                          metadata["current-snapshot-id"] ===
                          snapshot["snapshot-id"]
                            ? "bg-primary/5"
                            : ""
                        }
                      >
                        <TableCell className="font-mono text-xs">
                          {snapshot["snapshot-id"]}
                          {metadata["current-snapshot-id"] ===
                            snapshot["snapshot-id"] && (
                            <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                              Current
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatTimestamp(snapshot["timestamp-ms"])}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {snapshot.summary?.operation || "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {snapshot.summary?.["total-records"] || 0}
                        </TableCell>
                        <TableCell>
                          {formatBytes(
                            Number.parseInt(
                              snapshot.summary?.["total-files-size"] || "0"
                            )
                          )}
                        </TableCell>
                        <TableCell>{snapshot["schema-id"]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branches" className="mt-4 space-y-6">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded">
                  <GitBranch className="h-5 w-5" />
                </span>
                Branches
              </CardTitle>
              <CardDescription>
                Branch references for{" "}
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
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Snapshot ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(metadata.refs || {}).map(
                      ([name, ref]: [string, any]) => (
                        <TableRow key={name}>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {ref.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {ref["snapshot-id"]}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Branch Visualization
                </h3>
                <div className="h-[300px] w-full border border-border/40 rounded-md overflow-hidden">
                  <BranchGraph metadata={metadata} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-4">
          <Card className="border-border/40 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-primary/10 text-primary p-1 rounded">
                  <Clock className="h-5 w-5" />
                </span>
                Metadata Log
              </CardTitle>
              <CardDescription>
                Metadata file history for{" "}
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
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Metadata File</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metadata["metadata-log"]?.map(
                      (log: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            {formatTimestamp(log["timestamp-ms"])}
                          </TableCell>
                          <TableCell className="font-mono text-xs break-all">
                            {log["metadata-file"]}
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
      </Tabs>
    </div>
  );
}
