"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Plus,
  Minus,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

interface SchemaDiffViewerProps {
  sourceSchema: any;
  targetSchema: any;
  searchTerm: string;
  filterOptions: {
    showAdded: boolean;
    showRemoved: boolean;
    showModified: boolean;
    showUnchanged: boolean;
  };
}

export function SchemaDiffViewer({
  sourceSchema,
  targetSchema,
  searchTerm,
  filterOptions,
}: SchemaDiffViewerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      added: true,
      removed: true,
      modified: true,
      unchanged: false,
    }
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  if (!targetSchema) {
    return (
      <div className="rounded-md border border-border/40 p-8 text-center">
        <p className="text-muted-foreground">
          Select schema versions to compare
        </p>
      </div>
    );
  }

  // If no source schema is selected, we're viewing the initial schema
  const isInitialSchema = !sourceSchema;

  // Get fields from both schemas
  const sourceFields = sourceSchema?.fields || [];
  const targetFields = targetSchema?.fields || [];

  // Calculate differences
  const addedFields = isInitialSchema
    ? targetFields
    : targetFields.filter(
        (field: any) =>
          !sourceFields.some((sourceField: any) => sourceField.id === field.id)
      );

  const removedFields = isInitialSchema
    ? []
    : sourceFields.filter(
        (field: any) =>
          !targetFields.some((targetField: any) => targetField.id === field.id)
      );

  const modifiedFields = isInitialSchema
    ? []
    : targetFields.filter((field: any) => {
        const sourceField = sourceFields.find((sf: any) => sf.id === field.id);
        return (
          sourceField &&
          (sourceField.type !== field.type ||
            sourceField.required !== field.required ||
            sourceField.name !== field.name)
        );
      });

  const unchangedFields = isInitialSchema
    ? []
    : targetFields.filter((field: any) => {
        const sourceField = sourceFields.find((sf: any) => sf.id === field.id);
        return (
          sourceField &&
          sourceField.type === field.type &&
          sourceField.required === field.required &&
          sourceField.name === field.name
        );
      });

  // Apply search filter
  const filterBySearch = (field: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      field.name.toLowerCase().includes(searchLower) ||
      field.type.toLowerCase().includes(searchLower) ||
      field.id.toString().includes(searchLower)
    );
  };

  const filteredAddedFields = addedFields.filter(filterBySearch);
  const filteredRemovedFields = removedFields.filter(filterBySearch);
  const filteredModifiedFields = modifiedFields.filter(filterBySearch);
  const filteredUnchangedFields = unchangedFields.filter(filterBySearch);

  // Apply visibility filters
  const visibleAddedFields = filterOptions.showAdded ? filteredAddedFields : [];
  const visibleRemovedFields = filterOptions.showRemoved
    ? filteredRemovedFields
    : [];
  const visibleModifiedFields = filterOptions.showModified
    ? filteredModifiedFields
    : [];
  const visibleUnchangedFields = filterOptions.showUnchanged
    ? filteredUnchangedFields
    : [];

  // Check if we have any fields to display
  const hasVisibleFields =
    visibleAddedFields.length > 0 ||
    visibleRemovedFields.length > 0 ||
    visibleModifiedFields.length > 0 ||
    visibleUnchangedFields.length > 0;

  if (!hasVisibleFields) {
    return (
      <div className="rounded-md border border-border/40 p-8 text-center">
        <p className="text-muted-foreground">
          No fields match the current filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Schema Differences</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This view shows the differences between the selected schema
                  versions. Fields are categorized as added, removed, modified,
                  or unchanged.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isInitialSchema ? (
            <span>Viewing initial schema (v{targetSchema.version})</span>
          ) : (
            <span>
              Comparing v{sourceSchema.version} to v{targetSchema.version}
            </span>
          )}
        </div>
      </div>

      {/* Added Fields */}
      {visibleAddedFields.length > 0 && (
        <Collapsible
          open={expandedGroups.added}
          onOpenChange={() => toggleGroup("added")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-7">
                  {expandedGroups.added ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Badge className="bg-[oklch(0.9_0.1_140/0.2)] text-[oklch(0.5_0.2_140)] border-[oklch(0.8_0.1_140/0.2)]">
                  Added Fields
                </Badge>
                <span className="text-muted-foreground">
                  ({visibleAddedFields.length})
                </span>
              </h4>
            </div>
          </div>
          <CollapsibleContent>
            <Card className="mt-2 border-[oklch(0.8_0.1_140/0.2)]">
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[oklch(0.98_0.02_140/0.2)]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_140)]">
                          Field ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_140)]">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_140)]">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_140)]">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAddedFields.map((field: any, index: number) => (
                        <motion.tr
                          key={field.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-t border-[oklch(0.8_0.1_140/0.2)]"
                        >
                          <td className="px-4 py-2 text-sm font-mono">
                            {field.id}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium flex items-center gap-1">
                            <Plus className="h-3.5 w-3.5 text-[oklch(0.5_0.2_140)]" />
                            {field.name}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <Badge
                              variant="outline"
                              className="font-mono bg-background"
                            >
                              {field.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {field.required ? (
                              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                Yes
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Removed Fields */}
      {visibleRemovedFields.length > 0 && (
        <Collapsible
          open={expandedGroups.removed}
          onOpenChange={() => toggleGroup("removed")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-7">
                  {expandedGroups.removed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Badge className="bg-[oklch(0.9_0.1_30/0.2)] text-[oklch(0.5_0.2_30)] border-[oklch(0.8_0.1_30/0.2)]">
                  Removed Fields
                </Badge>
                <span className="text-muted-foreground">
                  ({visibleRemovedFields.length})
                </span>
              </h4>
            </div>
          </div>
          <CollapsibleContent>
            <Card className="mt-2 border-[oklch(0.8_0.1_30/0.2)]">
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[oklch(0.98_0.02_30/0.2)]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_30)]">
                          Field ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_30)]">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_30)]">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_30)]">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRemovedFields.map((field: any, index: number) => (
                        <motion.tr
                          key={field.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-t border-[oklch(0.8_0.1_30/0.2)]"
                        >
                          <td className="px-4 py-2 text-sm font-mono">
                            {field.id}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium flex items-center gap-1">
                            <Minus className="h-3.5 w-3.5 text-[oklch(0.5_0.2_30)]" />
                            <span className="line-through">{field.name}</span>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <Badge
                              variant="outline"
                              className="font-mono bg-background"
                            >
                              {field.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {field.required ? (
                              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                Yes
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Modified Fields */}
      {visibleModifiedFields.length > 0 && (
        <Collapsible
          open={expandedGroups.modified}
          onOpenChange={() => toggleGroup("modified")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-7">
                  {expandedGroups.modified ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Badge className="bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] border-[oklch(0.8_0.1_280/0.2)]">
                  Modified Fields
                </Badge>
                <span className="text-muted-foreground">
                  ({visibleModifiedFields.length})
                </span>
              </h4>
            </div>
          </div>
          <CollapsibleContent>
            <Card className="mt-2 border-[oklch(0.8_0.1_280/0.2)]">
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[oklch(0.98_0.02_280/0.2)]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_280)]">
                          Field ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_280)]">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_280)]">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_280)]">
                          Required
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-[oklch(0.4_0.1_280)]">
                          Changes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleModifiedFields.map(
                        (field: any, index: number) => {
                          const sourceField = sourceFields.find(
                            (sf: any) => sf.id === field.id
                          );
                          const changes = [];

                          if (sourceField.name !== field.name) {
                            changes.push(
                              `Name: ${sourceField.name} → ${field.name}`
                            );
                          }

                          if (sourceField.type !== field.type) {
                            changes.push(
                              `Type: ${sourceField.type} → ${field.type}`
                            );
                          }

                          if (sourceField.required !== field.required) {
                            changes.push(
                              `Required: ${sourceField.required ? "Yes" : "No"} → ${field.required ? "Yes" : "No"}`
                            );
                          }

                          return (
                            <motion.tr
                              key={field.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              className="border-t border-[oklch(0.8_0.1_280/0.2)]"
                            >
                              <td className="px-4 py-2 text-sm font-mono">
                                {field.id}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium flex items-center gap-1">
                                <RefreshCw className="h-3.5 w-3.5 text-[oklch(0.5_0.2_280)]" />
                                {field.name}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant="outline"
                                    className="font-mono bg-background"
                                  >
                                    {field.type}
                                  </Badge>
                                  {sourceField.type !== field.type && (
                                    <Badge
                                      variant="outline"
                                      className="font-mono text-[oklch(0.5_0.2_30)] line-through"
                                    >
                                      {sourceField.type}
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {field.required ? (
                                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                    Yes
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">
                                    No
                                  </span>
                                )}
                                {sourceField.required !== field.required && (
                                  <div className="mt-1 text-xs text-[oklch(0.5_0.2_30)] line-through">
                                    {sourceField.required ? "Yes" : "No"}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2 text-xs text-muted-foreground">
                                <ul className="list-disc pl-4 space-y-1">
                                  {changes.map((change, i) => (
                                    <li key={i}>{change}</li>
                                  ))}
                                </ul>
                              </td>
                            </motion.tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Unchanged Fields */}
      {visibleUnchangedFields.length > 0 && (
        <Collapsible
          open={expandedGroups.unchanged}
          onOpenChange={() => toggleGroup("unchanged")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-7">
                  {expandedGroups.unchanged ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Badge variant="outline">Unchanged Fields</Badge>
                <span className="text-muted-foreground">
                  ({visibleUnchangedFields.length})
                </span>
              </h4>
            </div>
          </div>
          <CollapsibleContent>
            <Card className="mt-2">
              <CardContent className="p-0">
                <div className="rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium">
                          Field ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUnchangedFields.map(
                        (field: any, index: number) => (
                          <motion.tr
                            key={field.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-t border-border/40"
                          >
                            <td className="px-4 py-2 text-sm font-mono">
                              {field.id}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium">
                              {field.name}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <Badge
                                variant="outline"
                                className="font-mono bg-background"
                              >
                                {field.type}
                              </Badge>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {field.required ? (
                                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                                  Yes
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">
                                  No
                                </span>
                              )}
                            </td>
                          </motion.tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
