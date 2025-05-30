"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitCompare } from "lucide-react";

interface SchemaVersionSelectorProps {
  versions: any[];
  sourceVersion: number | null;
  targetVersion: number | null;
  onSourceChange: (version: number | null) => void;
  onTargetChange: (version: number) => void;
}

export function SchemaVersionSelector({
  versions,
  sourceVersion,
  targetVersion,
  onSourceChange,
  onTargetChange,
}: SchemaVersionSelectorProps) {
  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 space-y-1 min-w-[200px]">
            <label htmlFor="source-version" className="text-sm font-medium">
              Source Version
            </label>
            <Select
              value={sourceVersion?.toString() || ""}
              onValueChange={(value) =>
                onSourceChange(value ? Number.parseInt(value) : null)
              }
            >
              <SelectTrigger id="source-version" className="w-full">
                <SelectValue placeholder="Select source version" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">Initial Schema</SelectItem>
                {versions.slice(0, -1).map((version) => (
                  <SelectItem key={version.id} value={version.id.toString()}>
                    v{version.version} ({formatTimestamp(version.timestamp)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {sourceVersion === null
                ? "Compare with initial schema"
                : `Schema ID: ${sourceVersion}`}
            </p>
          </div>

          <div className="self-center pt-4 md:pt-0">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="flex-1 space-y-1 min-w-[200px]">
            <label htmlFor="target-version" className="text-sm font-medium">
              Target Version
            </label>
            <Select
              value={targetVersion?.toString() || ""}
              onValueChange={(value) => onTargetChange(Number.parseInt(value))}
            >
              <SelectTrigger id="target-version" className="w-full">
                <SelectValue placeholder="Select target version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id.toString()}>
                    v{version.version} ({formatTimestamp(version.timestamp)})
                    {version.id === versions[versions.length - 1].id && (
                      <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                        Latest
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {targetVersion !== null
                ? `Schema ID: ${targetVersion}`
                : "Select a target version"}
            </p>
          </div>

          <div className="self-end md:self-center pt-4 md:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                if (versions.length >= 2) {
                  onSourceChange(versions[versions.length - 2].id);
                  onTargetChange(versions[versions.length - 1].id);
                }
              }}
            >
              <GitCompare className="h-4 w-4" />
              <span>Latest Diff</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
