"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchemaVersionSelector } from "./Schema/schema-version-selector";
import { SchemaDiffViewer } from "./Schema/schema-diff-viewer";
import { SchemaEvolutionTimeline } from "./Schema/schema-evolution-timeline";
import { SchemaSearchFilter } from "./Schema/schema-search-filter";
import { FileIcon as FileHistory, GitCompare, History } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SchemaComparisonProps {
  metadata: any;
}

export function SchemaComparison({ metadata }: SchemaComparisonProps) {
  // State for selected schema versions
  const [sourceVersion, setSourceVersion] = useState<number | null>(null);
  const [targetVersion, setTargetVersion] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    showAdded: true,
    showRemoved: true,
    showModified: true,
    showUnchanged: false,
  });

  // Extract schema versions from metadata
  const schemaVersions =
    metadata.schemas?.map((schema: any, index: number) => ({
      id: schema["schema-id"],
      version: index + 1,
      timestamp:
        metadata.snapshots?.[index]?.["timestamp-ms"] ||
        Date.now() - index * 86400000,
      fields: schema.fields || [],
    })) || [];

  // If we don't have real schema versions in the metadata, create some sample ones
  const sampleSchemaVersions = [
    {
      id: 0,
      version: 1,
      timestamp: Date.now() - 7 * 86400000,
      fields: metadata.schemas?.[0]?.fields || [],
    },
    {
      id: 1,
      version: 2,
      timestamp: Date.now() - 5 * 86400000,
      fields: [
        ...(metadata.schemas?.[0]?.fields || []),
        { id: 20, name: "payment_provider", required: false, type: "string" },
        { id: 21, name: "payment_method_id", required: false, type: "string" },
      ],
    },
    {
      id: 2,
      version: 3,
      timestamp: Date.now() - 3 * 86400000,
      fields: [
        ...(metadata.schemas?.[0]?.fields || []).filter(
          (f: any) => f.name !== "store_and_fwd_flag"
        ),
        { id: 20, name: "payment_provider", required: true, type: "string" }, // Changed required from false to true
        { id: 21, name: "payment_method_id", required: false, type: "string" },
        { id: 22, name: "trip_type", required: false, type: "string" },
      ],
    },
    {
      id: 3,
      version: 4,
      timestamp: Date.now() - 1 * 86400000,
      fields: [
        ...(metadata.schemas?.[0]?.fields || []).filter(
          (f: any) =>
            f.name !== "store_and_fwd_flag" &&
            f.name !== "improvement_surcharge"
        ),
        { id: 20, name: "payment_provider", required: true, type: "string" },
        { id: 21, name: "payment_method_id", required: true, type: "string" }, // Changed required from false to true
        { id: 22, name: "trip_type", required: false, type: "string" },
        { id: 23, name: "driver_id", required: false, type: "long" },
        { id: 24, name: "service_fee", required: false, type: "double" },
      ],
    },
  ];

  const versions =
    schemaVersions.length > 1 ? schemaVersions : sampleSchemaVersions;

  // Set initial versions
  useEffect(() => {
    if (versions.length > 0) {
      setTargetVersion(versions[versions.length - 1].id);
      setSourceVersion(
        versions.length > 1 ? versions[versions.length - 2].id : null
      );
    }
  }, [versions]);

  // Get the selected schema versions
  interface Schema {
    id: number;
    version: number;
    timestamp: number;
    fields: Field[];
  }

  interface Field {
    id: number;
    name: string;
    required: boolean;
    type: string;
  }

  const sourceSchema: Schema | null =
    sourceVersion !== null
      ? versions.find((v: Schema) => v.id === sourceVersion) || null
      : null;

  const targetSchema =
    targetVersion !== null
      ? versions.find((v: Schema) => v.id === targetVersion)
      : null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary p-1.5 rounded-md">
                <GitCompare className="h-5 w-5" />
              </span>
              Schema Evolution Tracker
            </CardTitle>
            <CardDescription>
              Compare schema versions to track changes over time for{" "}
              <Badge variant="outline">
                {metadata.location?.split("/").pop()}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="compare" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger
                  value="compare"
                  className="flex items-center gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare Versions
                </TabsTrigger>
                <TabsTrigger
                  value="timeline"
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Evolution Timeline
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <FileHistory className="h-4 w-4" />
                  Schema History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="compare" className="space-y-4">
                <SchemaVersionSelector
                  versions={versions}
                  sourceVersion={sourceVersion}
                  targetVersion={targetVersion}
                  onSourceChange={setSourceVersion}
                  onTargetChange={setTargetVersion}
                />

                <SchemaSearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  filterOptions={filterOptions}
                  onFilterChange={setFilterOptions}
                />

                <SchemaDiffViewer
                  sourceSchema={sourceSchema}
                  targetSchema={targetSchema}
                  searchTerm={searchTerm}
                  filterOptions={filterOptions}
                />
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <SchemaEvolutionTimeline versions={versions} />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="rounded-md border border-border/40 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Version
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Fields
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Changes
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Snapshot ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((version: Schema, index: number) => {
                        const prevVersion: Schema | null =
                          index > 0 ? versions[index - 1] : null;
                        const addedFields: Field[] = prevVersion
                          ? version.fields.filter(
                              (f: Field) =>
                                !prevVersion.fields.some(
                                  (pf: Field) => pf.id === f.id
                                )
                            )
                          : [];
                        const removedFields: Field[] = prevVersion
                          ? prevVersion.fields.filter(
                              (f: Field) =>
                                !version.fields.some(
                                  (cf: Field) => cf.id === f.id
                                )
                            )
                          : [];
                        const modifiedFields: Field[] = prevVersion
                          ? version.fields.filter((f: Field) => {
                              const prevField: Field | undefined =
                                prevVersion.fields.find(
                                  (pf: Field) => pf.id === f.id
                                );
                              return (
                                prevField &&
                                (prevField.type !== f.type ||
                                  prevField.required !== f.required ||
                                  prevField.name !== f.name)
                              );
                            })
                          : [];

                        return (
                          <tr
                            key={version.id}
                            className="border-t border-border/40"
                          >
                            <td className="px-4 py-3 text-sm">
                              <Badge
                                variant={
                                  index === versions.length - 1
                                    ? "default"
                                    : "outline"
                                }
                              >
                                v{version.version}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(version.timestamp).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {version.fields.length}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {index === 0 ? (
                                <span className="text-muted-foreground">
                                  Initial schema
                                </span>
                              ) : (
                                <div className="flex gap-2">
                                  {addedFields.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-[oklch(0.9_0.1_140/0.2)] text-[oklch(0.5_0.2_140)] border-[oklch(0.8_0.1_140/0.2)]"
                                    >
                                      +{addedFields.length}
                                    </Badge>
                                  )}
                                  {removedFields.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-[oklch(0.9_0.1_30/0.2)] text-[oklch(0.5_0.2_30)] border-[oklch(0.8_0.1_30/0.2)]"
                                    >
                                      -{removedFields.length}
                                    </Badge>
                                  )}
                                  {modifiedFields.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] border-[oklch(0.8_0.1_280/0.2)]"
                                    >
                                      ~{modifiedFields.length}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-xs">
                              {metadata.snapshots?.[index]?.["snapshot-id"]
                                ?.toString()
                                .slice(0, 8) || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
