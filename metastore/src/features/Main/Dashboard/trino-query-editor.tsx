"use client";

import { useState, useRef, useEffect } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Download,
  Copy,
  Clock,
  Terminal,
  Table2,
  History,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  Sparkles,
  Zap,
  XCircle,
  ChevronDown,
  HardDrive,
  Server,
  Cpu,
  MemoryStick,
  Search,
  FileCode,
  BookOpen,
  LayoutList,
  Hash,
  Type,
  Key,
  RefreshCw,
  Layers,
  GitBranch,
  Info,
  Filter,
  Settings,
  Maximize2,
  Minimize2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type QueryStatus = "success" | "error" | "executing";

interface QueryHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  status: QueryStatus;
  executionTime?: string;
  rowCount?: number;
}

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: string;
  status: QueryStatus;
  error?: string;
  stats?: {
    cpu: string;
    memory: string;
    processedRows: number;
    processedBytes: number;
  };
}

interface SampleQuery {
  id: string;
  name: string;
  query: string;
  description: string;
  category: string;
  complexity: "beginner" | "intermediate" | "advanced";
}

interface TableMetadata {
  name: string;
  schema: string;
  catalog: string;
  columns: ColumnMetadata[];
  partitionedBy?: string[];
  format?: string;
  location?: string;
}

interface ColumnMetadata {
  id: number;
  name: string;
  type: string;
  required: boolean;
  isPrimaryKey?: boolean;
  isPartitionKey?: boolean;
}

interface SchemaMetadata {
  name: string;
  tables: TableMetadata[];
}

interface CatalogMetadata {
  name: string;
  schemas: SchemaMetadata[];
}

const SAMPLE_QUERIES: SampleQuery[] = [
  {
    id: "1",
    name: "Show Tables",
    query: "SHOW TABLES FROM iceberg.default",
    description: "List all tables in the default schema",
    category: "Metadata",
    complexity: "beginner",
  },
  {
    id: "2",
    name: "Table Schema",
    query: "DESCRIBE iceberg.default.nyc_taxi_iceberg",
    description: "Show schema of NYC Taxi table",
    category: "Metadata",
    complexity: "beginner",
  },
  {
    id: "3",
    name: "Sample Data",
    query: "SELECT * FROM iceberg.default.nyc_taxi_iceberg LIMIT 10",
    description: "Preview first 10 rows",
    category: "Data Exploration",
    complexity: "beginner",
  },
  {
    id: "4",
    name: "Basic Analytics",
    query: `SELECT 
  DATE_TRUNC('hour', tpep_pickup_datetime) as pickup_hour,
  COUNT(*) as trip_count,
  AVG(trip_distance) as avg_distance,
  AVG(total_amount) as avg_amount
FROM iceberg.default.nyc_taxi_iceberg
GROUP BY 1
ORDER BY 1 DESC
LIMIT 24`,
    description: "Hourly trip statistics",
    category: "Analytics",
    complexity: "intermediate",
  },
  {
    id: "5",
    name: "Top Pickup Locations",
    query: `SELECT 
  pickup_zone.zone as pickup_location,
  COUNT(*) as trip_count,
  AVG(total_amount) as avg_amount
FROM iceberg.default.nyc_taxi_iceberg trips
JOIN iceberg.default.taxi_zone_lookup pickup_zone
  ON trips.pulocationid = pickup_zone.locationid
GROUP BY 1
ORDER BY 2 DESC
LIMIT 10`,
    description: "Most popular pickup locations",
    category: "Analytics",
    complexity: "advanced",
  },
];

const COMPLEXITY_COLORS = {
  beginner:
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  intermediate:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  advanced:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
};

// Generate catalog metadata from the sample metadata
const generateCatalogMetadata = (sampleMetadata: any): CatalogMetadata[] => {
  // Extract schema information from the sample metadata
  const schemaFields = sampleMetadata.schemas[0].fields;

  // Create a table metadata object for the NYC taxi table
  const nycTaxiTable: TableMetadata = {
    name: "nyc_taxi_iceberg",
    schema: "default",
    catalog: "iceberg",
    columns: schemaFields.map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      required: field.required,
      isPrimaryKey: false,
      isPartitionKey: sampleMetadata["partition-specs"][0].fields.some(
        (pf: any) => pf["source-id"] === field.id
      ),
    })),
    partitionedBy: sampleMetadata["partition-specs"][0].fields.map(
      (pf: any) => {
        const sourceField = schemaFields.find(
          (f: any) => f.id === pf["source-id"]
        );
        return sourceField ? sourceField.name : "";
      }
    ),
    format: "iceberg",
    location: sampleMetadata.location,
  };

  // Create a table metadata object for the taxi zone lookup table (referenced in sample queries)
  const taxiZoneLookupTable: TableMetadata = {
    name: "taxi_zone_lookup",
    schema: "default",
    catalog: "iceberg",
    columns: [
      {
        id: 1,
        name: "locationid",
        type: "long",
        required: true,
        isPrimaryKey: true,
      },
      { id: 2, name: "borough", type: "string", required: false },
      { id: 3, name: "zone", type: "string", required: false },
      { id: 4, name: "service_zone", type: "string", required: false },
    ],
    format: "iceberg",
  };

  // Create a catalog metadata structure
  return [
    {
      name: "iceberg",
      schemas: [
        {
          name: "default",
          tables: [nycTaxiTable, taxiZoneLookupTable],
        },
      ],
    },
    {
      name: "system",
      schemas: [
        {
          name: "runtime",
          tables: [
            {
              name: "nodes",
              schema: "runtime",
              catalog: "system",
              columns: [
                { id: 1, name: "node_id", type: "string", required: true },
                { id: 2, name: "http_uri", type: "string", required: true },
                { id: 3, name: "node_version", type: "string", required: true },
                { id: 4, name: "coordinator", type: "boolean", required: true },
                { id: 5, name: "state", type: "string", required: true },
              ],
            },
            {
              name: "queries",
              schema: "runtime",
              catalog: "system",
              columns: [
                { id: 1, name: "query_id", type: "string", required: true },
                { id: 2, name: "user", type: "string", required: true },
                { id: 3, name: "state", type: "string", required: true },
                { id: 4, name: "query", type: "string", required: true },
                { id: 5, name: "query_type", type: "string", required: false },
              ],
            },
          ],
        },
        {
          name: "metadata",
          tables: [
            {
              name: "catalogs",
              schema: "metadata",
              catalog: "system",
              columns: [
                { id: 1, name: "catalog_name", type: "string", required: true },
                { id: 2, name: "connector_id", type: "string", required: true },
              ],
            },
            {
              name: "schemas",
              schema: "metadata",
              catalog: "system",
              columns: [
                { id: 1, name: "catalog_name", type: "string", required: true },
                { id: 2, name: "schema_name", type: "string", required: true },
              ],
            },
          ],
        },
      ],
    },
  ];
};

interface TrinoQueryEditorProps {
  sampleMetadata: any;
}

export function TrinoQueryEditor({ sampleMetadata }: TrinoQueryEditorProps) {
  const [query, setQuery] = useState<string>(
    "SELECT * FROM iceberg.default.nyc_taxi_iceberg LIMIT 100"
  );
  const [activeTab, setActiveTab] = useState<"schema" | "examples" | "history">(
    "schema"
  );
  const [queryState, setQueryState] = useState<{
    status: QueryStatus;
    progress?: number;
  }>({
    status: "success",
  });
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [schemaFilter, setSchemaFilter] = useState("");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    iceberg: true,
    "iceberg.default": true,
  });
  const [selectedTable, setSelectedTable] = useState<TableMetadata | null>(
    null
  );
  const [catalogMetadata, setCatalogMetadata] = useState<CatalogMetadata[]>([]);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const isMobile = false;

  // Initialize catalog metadata from sample metadata
  useEffect(() => {
    if (sampleMetadata) {
      const metadata = generateCatalogMetadata(sampleMetadata);
      setCatalogMetadata(metadata);
    }
  }, [sampleMetadata]);

  // Load saved history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("trinoQueryHistory");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const historyWithDates = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setQueryHistory(historyWithDates);
      } catch (e) {
        console.error("Failed to parse saved query history", e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem("trinoQueryHistory", JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.languages.registerCompletionItemProvider("sql", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Basic SQL keywords
        const suggestions = [
          {
            label: "SELECT",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "SELECT ",
            documentation: "Select data from a table",
            range,
          },
          {
            label: "FROM",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "FROM ",
            documentation: "Specify the table to query",
            range,
          },
          {
            label: "WHERE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "WHERE ",
            documentation: "Filter rows based on a condition",
            range,
          },
          {
            label: "GROUP BY",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "GROUP BY ",
            documentation: "Group rows that have the same values",
            range,
          },
          {
            label: "ORDER BY",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "ORDER BY ",
            documentation: "Sort the result set",
            range,
          },
          {
            label: "LIMIT",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "LIMIT ",
            documentation: "Limit the number of rows returned",
            range,
          },
        ];

        // Add table suggestions from metadata
        catalogMetadata.forEach((catalog) => {
          catalog.schemas.forEach((schema) => {
            schema.tables.forEach((table) => {
              suggestions.push({
                label: `${catalog.name}.${schema.name}.${table.name}`,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: `${catalog.name}.${schema.name}.${table.name}`,
                documentation: `Table: ${table.name} in ${schema.name} schema`,
                range,
              });

              // Add column suggestions for each table
              table.columns.forEach((column) => {
                suggestions.push({
                  label: column.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: column.name,
                  documentation: `Column: ${column.name} (${column.type})`,
                  range,
                });
              });
            });
          });
        });

        return { suggestions };
      },
    });
  };

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error("Empty Query", {
        description: "Please enter a query to execute",
      });
      return;
    }

    setQueryState({ status: "executing", progress: 0 });
    setResults(null);

    const toastId = toast.loading("Executing query...", {
      description: "Your query is being processed",
    });

    const progressInterval = setInterval(() => {
      setQueryState((prev) => ({
        ...prev,
        progress: Math.min(95, (prev.progress || 0) + Math.random() * 15),
      }));
    }, 300);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1000)
      );
      const isSuccess = Math.random() > 0.2;

      if (isSuccess) {
        const rowCount = Math.floor(Math.random() * 100) + 10;
        const executionTime = `${(Math.random() * 2 + 0.5).toFixed(1)} seconds`;

        const sampleResult: QueryResult = {
          columns: [
            "vendorid",
            "tpep_pickup_datetime",
            "tpep_dropoff_datetime",
            "passenger_count",
            "trip_distance",
            "total_amount",
          ],
          rows: Array(rowCount)
            .fill(null)
            .map(() => [
              Math.floor(Math.random() * 2) + 1,
              new Date(
                2024,
                0,
                1,
                Math.floor(Math.random() * 24),
                Math.floor(Math.random() * 60)
              ).toISOString(),
              new Date(
                2024,
                0,
                1,
                Math.floor(Math.random() * 24),
                Math.floor(Math.random() * 60)
              ).toISOString(),
              Math.floor(Math.random() * 4) + 1,
              (Math.random() * 10).toFixed(2),
              (Math.random() * 100).toFixed(2),
            ]),
          rowCount,
          executionTime,
          status: "success",
          stats: {
            cpu: `${(Math.random() * 50 + 10).toFixed(0)}%`,
            memory: `${(Math.random() * 4 + 1).toFixed(1)}GB`,
            processedRows: Math.floor(Math.random() * 100000) + 10000,
            processedBytes: Math.floor(Math.random() * 500000000) + 10000000,
          },
        };

        setResults(sampleResult);
        addToHistory(query, "success", executionTime, rowCount);

        toast.success("Query Completed", {
          description: `Processed ${rowCount} rows in ${executionTime}`,
          id: toastId,
        });
      } else {
        const errorResult: QueryResult = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: `${(Math.random() * 0.5 + 0.1).toFixed(1)} seconds`,
          status: "error",
          error:
            Math.random() > 0.5
              ? "Error: Table 'iceberg.default.nyc_taxi_iceberg' not found"
              : "Error: Syntax error at line 1, column 8: mismatched input 'FRO' expecting {'(', 'CROSS', 'EXCEPT', 'FULL', 'GROUP', 'HAVING', 'INNER', 'INTERSECT', 'JOIN', 'LEFT', 'LIMIT', 'NATURAL', 'ORDER', 'RIGHT', 'UNION', 'WHERE', <identifier>, <quoted_identifier>}",
        };

        setResults(errorResult);
        addToHistory(query, "error");

        toast.error("Query Failed", {
          description: errorResult.error,
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Query execution error:", error);
      toast.error("Execution Error", {
        description: "An unexpected error occurred",
        id: toastId,
      });
    } finally {
      clearInterval(progressInterval);
      setQueryState({ status: "success" });
    }
  };

  const addToHistory = (
    queryText: string,
    status: QueryStatus,
    executionTime?: string,
    rowCount?: number
  ) => {
    const newHistoryItem: QueryHistoryItem = {
      id: Date.now().toString(),
      query: queryText,
      timestamp: new Date(),
      status,
      executionTime,
      rowCount,
    };

    setQueryHistory((prev) => {
      const newHistory = [newHistoryItem, ...prev].slice(0, 50);
      return newHistory;
    });
  };

  const downloadResults = (format: "csv" | "json" = "csv") => {
    if (!results || results.status === "error") return;

    let content, mimeType, extension;

    if (format === "csv") {
      const headers = results.columns.join(",");
      const rows = results.rows.map((row) => row.join(",")).join("\n");
      content = `${headers}\n${rows}`;
      mimeType = "text/csv";
      extension = "csv";
    } else {
      const data = {
        columns: results.columns,
        rows: results.rows,
        metadata: {
          rowCount: results.rowCount,
          executionTime: results.executionTime,
          generatedAt: new Date().toISOString(),
        },
      };
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_results_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.${extension}`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Download Started", {
      description: `Your data is being downloaded as ${extension.toUpperCase()}`,
    });
  };

  const copyToClipboard = (text: string, message?: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to Clipboard", {
      description: message || "The content has been copied",
    });
  };

  const clearHistory = () => {
    setQueryHistory([]);
    localStorage.removeItem("trinoQueryHistory");
    toast.success("History Cleared", {
      description: "Your query history has been cleared",
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    );
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const insertTableName = (catalog: string, schema: string, table: string) => {
    const fullTableName = `${catalog}.${schema}.${table}`;
    const currentValue = editorRef.current?.getValue() || "";

    // Simple heuristic to determine if we should insert the table name or just replace the editor content
    if (currentValue.trim() === "" || currentValue.trim() === "SELECT * FROM") {
      setQuery(`SELECT * FROM ${fullTableName} LIMIT 100`);
    } else {
      // Try to find a position to insert the table name
      const fromIndex = currentValue.toUpperCase().indexOf("FROM ");
      if (fromIndex !== -1) {
        // Check if there's already a table name after FROM
        const afterFrom = currentValue.substring(fromIndex + 5).trim();
        if (
          afterFrom === "" ||
          afterFrom.startsWith("WHERE") ||
          afterFrom.startsWith("GROUP") ||
          afterFrom.startsWith("ORDER")
        ) {
          // Insert the table name after FROM
          const newQuery = `${currentValue.substring(0, fromIndex + 5)} ${fullTableName} ${afterFrom}`;
          setQuery(newQuery);
        } else {
          // Replace the existing table name
          const whereIndex = afterFrom.indexOf("WHERE");
          const groupByIndex = afterFrom.indexOf("GROUP BY");
          const orderByIndex = afterFrom.indexOf("ORDER BY");
          const limitIndex = afterFrom.indexOf("LIMIT");

          let endIndex = -1;
          if (whereIndex !== -1) endIndex = whereIndex;
          else if (groupByIndex !== -1) endIndex = groupByIndex;
          else if (orderByIndex !== -1) endIndex = orderByIndex;
          else if (limitIndex !== -1) endIndex = limitIndex;

          if (endIndex !== -1) {
            const newQuery = `${currentValue.substring(0, fromIndex + 5)} ${fullTableName} ${afterFrom.substring(endIndex)}`;
            setQuery(newQuery);
          } else {
            const newQuery = `${currentValue.substring(0, fromIndex + 5)} ${fullTableName}`;
            setQuery(newQuery);
          }
        }
      } else {
        // If there's no FROM clause, append it
        setQuery(`${currentValue}\nFROM ${fullTableName}`);
      }
    }

    // Focus the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertColumnName = (columnName: string) => {
    if (!editorRef.current) return;

    const currentValue = editorRef.current.getValue();
    const selectIndex = currentValue.toUpperCase().indexOf("SELECT ");

    if (selectIndex !== -1) {
      const afterSelect = currentValue.substring(selectIndex + 7).trim();
      if (afterSelect.startsWith("*") || afterSelect.startsWith("FROM")) {
        // Replace the * with the column name
        const newQuery = `${currentValue.substring(0, selectIndex + 7)} ${columnName} ${afterSelect.substring(afterSelect.startsWith("*") ? 1 : 0).trim()}`;
        setQuery(newQuery);
      } else {
        // Add the column name to the existing columns
        const fromIndex = afterSelect.toUpperCase().indexOf("FROM");
        if (fromIndex !== -1) {
          const columns = afterSelect.substring(0, fromIndex).trim();
          const rest = afterSelect.substring(fromIndex);
          const newQuery = `${currentValue.substring(0, selectIndex + 7)} ${columns}, ${columnName} ${rest}`;
          setQuery(newQuery);
        } else {
          // No FROM clause yet, just append the column name
          const newQuery = `${currentValue.substring(0, selectIndex + 7)} ${afterSelect}, ${columnName}`;
          setQuery(newQuery);
        }
      }
    } else {
      // No SELECT statement yet, create one
      setQuery(`SELECT ${columnName} FROM `);
    }

    // Focus the editor
    editorRef.current.focus();
  };

  const generateSelectAllColumnsQuery = (table: TableMetadata) => {
    const fullTableName = `${table.catalog}.${table.schema}.${table.name}`;
    const columnsList = table.columns.map((col) => col.name).join(", ");
    setQuery(`SELECT ${columnsList}\nFROM ${fullTableName}\nLIMIT 100`);

    // Focus the editor
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const renderSchemaExplorer = () => {
    const filteredCatalogs = catalogMetadata
      .map((catalog) => ({
        ...catalog,
        schemas: catalog.schemas
          .map((schema) => ({
            ...schema,
            tables: schema.tables.filter(
              (table) =>
                table.name.toLowerCase().includes(schemaFilter.toLowerCase()) ||
                schema.name
                  .toLowerCase()
                  .includes(schemaFilter.toLowerCase()) ||
                catalog.name.toLowerCase().includes(schemaFilter.toLowerCase())
            ),
          }))
          .filter((schema) => schema.tables.length > 0),
      }))
      .filter((catalog) => catalog.schemas.length > 0);

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search schemas and tables..."
              value={schemaFilter}
              onChange={(e) => setSchemaFilter(e.target.value)}
              className="pl-9 h-9 text-sm bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <AnimatePresence>
            {filteredCatalogs.length > 0 ? (
              <div className="p-3 md:p-4 space-y-2">
                {filteredCatalogs.map((catalog) => (
                  <div key={catalog.name} className="space-y-1">
                    <Collapsible
                      open={expandedItems[catalog.name]}
                      onOpenChange={() => toggleExpanded(catalog.name)}
                    >
                      <CollapsibleTrigger className="flex items-center w-full rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <motion.div
                          animate={{
                            rotate: expandedItems[catalog.name] ? 90 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className="mr-1"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        </motion.div>
                        <Database className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="font-medium text-sm">
                          {catalog.name}
                        </span>
                        <Badge className="ml-2 text-xs" variant="outline">
                          {catalog.schemas.length} schema
                          {catalog.schemas.length !== 1 ? "s" : ""}
                        </Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-6 pl-2 border-l border-slate-200 dark:border-slate-700 space-y-1"
                        >
                          {catalog.schemas.map((schema) => (
                            <Collapsible
                              key={`${catalog.name}.${schema.name}`}
                              open={
                                expandedItems[`${catalog.name}.${schema.name}`]
                              }
                              onOpenChange={() =>
                                toggleExpanded(`${catalog.name}.${schema.name}`)
                              }
                            >
                              <CollapsibleTrigger className="flex items-center w-full rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <motion.div
                                  animate={{
                                    rotate: expandedItems[
                                      `${catalog.name}.${schema.name}`
                                    ]
                                      ? 90
                                      : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                  className="mr-1"
                                >
                                  <ChevronRight className="h-4 w-4 text-slate-500" />
                                </motion.div>
                                <LayoutList className="h-4 w-4 mr-2 text-purple-500" />
                                <span className="text-sm">{schema.name}</span>
                                <Badge
                                  className="ml-2 text-xs"
                                  variant="outline"
                                >
                                  {schema.tables.length} table
                                  {schema.tables.length !== 1 ? "s" : ""}
                                </Badge>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-6 pl-2 border-l border-slate-200 dark:border-slate-700 space-y-1"
                                >
                                  {schema.tables.map((table) => (
                                    <Collapsible
                                      key={`${catalog.name}.${schema.name}.${table.name}`}
                                      open={
                                        expandedItems[
                                          `${catalog.name}.${schema.name}.${table.name}`
                                        ]
                                      }
                                      onOpenChange={() =>
                                        toggleExpanded(
                                          `${catalog.name}.${schema.name}.${table.name}`
                                        )
                                      }
                                    >
                                      <CollapsibleTrigger
                                        className="flex items-center w-full rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                        onClick={() => setSelectedTable(table)}
                                      >
                                        <motion.div
                                          animate={{
                                            rotate: expandedItems[
                                              `${catalog.name}.${schema.name}.${table.name}`
                                            ]
                                              ? 90
                                              : 0,
                                          }}
                                          transition={{ duration: 0.2 }}
                                          className="mr-1"
                                        >
                                          <ChevronRight className="h-4 w-4 text-slate-500" />
                                        </motion.div>
                                        <Table2 className="h-4 w-4 mr-2 text-emerald-500" />
                                        <span className="text-sm">
                                          {table.name}
                                        </span>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  insertTableName(
                                                    catalog.name,
                                                    schema.name,
                                                    table.name
                                                  );
                                                }}
                                              >
                                                <FileCode className="h-3.5 w-3.5 text-blue-500" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              Insert table in query
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{
                                            opacity: 1,
                                            height: "auto",
                                          }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="ml-6 pl-2 border-l border-slate-200 dark:border-slate-700"
                                        >
                                          <div className="py-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 text-xs w-full justify-start text-blue-600 dark:text-blue-400 font-medium"
                                              onClick={() =>
                                                generateSelectAllColumnsQuery(
                                                  table
                                                )
                                              }
                                            >
                                              <span>
                                                SELECT * FROM {table.name}
                                              </span>
                                            </Button>
                                          </div>
                                          {table.columns.map((column) => (
                                            <div
                                              key={`${table.name}.${column.name}`}
                                              className="flex items-center py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md group"
                                            >
                                              {column.isPrimaryKey ? (
                                                <Key className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                              ) : column.isPartitionKey ? (
                                                <Hash className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                              ) : (
                                                <Type className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                              )}
                                              <span className="text-xs font-mono">
                                                {column.name}
                                              </span>
                                              <span className="text-xs text-slate-500 ml-2">
                                                {column.type}
                                              </span>
                                              {column.required && (
                                                <span className="text-xs text-red-500 ml-1">
                                                  *
                                                </span>
                                              )}
                                              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-5 w-5 p-0"
                                                      onClick={() =>
                                                        insertColumnName(
                                                          column.name
                                                        )
                                                      }
                                                    >
                                                      <Plus className="h-3 w-3 text-blue-500" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    Add column to query
                                                  </TooltipContent>
                                                </Tooltip>
                                              </div>
                                            </div>
                                          ))}
                                        </motion.div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ))}
                                </motion.div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </motion.div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center p-4">
                <Search className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  No matching schemas or tables
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search term
                </p>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {selectedTable && (
          <div className="p-3 md:p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">{selectedTable.name}</h3>
              <Badge variant="outline" className="text-xs">
                {selectedTable.format || "table"}
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mb-2">
              {selectedTable.catalog}.{selectedTable.schema}.
              {selectedTable.name}
            </div>
            {selectedTable.partitionedBy &&
              selectedTable.partitionedBy.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    Partitioned by: {selectedTable.partitionedBy.join(", ")}
                  </Badge>
                </div>
              )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="text-xs gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                onClick={() =>
                  insertTableName(
                    selectedTable.catalog,
                    selectedTable.schema,
                    selectedTable.name
                  )
                }
              >
                <FileCode className="h-3.5 w-3.5" />
                Query Table
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5"
                onClick={() => {
                  setQuery(
                    `DESCRIBE ${selectedTable.catalog}.${selectedTable.schema}.${selectedTable.name}`
                  );
                  executeQuery();
                }}
              >
                <Info className="h-3.5 w-3.5" />
                Describe
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExampleQueries = () => {
    return (
      <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
        <div className="p-3 md:p-4 grid gap-3 md:gap-4">
          {SAMPLE_QUERIES.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 group">
                <CardHeader className="p-2 md:p-3 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-sm">{item.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {item.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className={cn(
                          "bg-blue-100 text-blue-700 border-blue-200 text-xs py-0 px-1.5",
                          COMPLEXITY_COLORS[item.complexity]
                        )}
                      >
                        {item.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize py-0 px-1.5"
                      >
                        {item.complexity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 md:p-3 pt-0">
                  <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg overflow-x-auto font-mono mt-2 max-h-24 overflow-y-auto">
                    <code>{item.query}</code>
                  </pre>
                  <div className="flex gap-2 mt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            setQuery(item.query);
                            toast.success("Query Loaded", {
                              description: `"${item.name}" has been loaded into the editor`,
                            });
                          }}
                          className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 group-hover:shadow-md transition-all"
                          size="sm"
                        >
                          <Copy className="h-3 w-3" />
                          <span className="hidden sm:inline">Use Query</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Load query into editor</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            copyToClipboard(
                              item.query,
                              `"${item.name}" query copied to clipboard`
                            );
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy to clipboard</TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderQueryHistory = () => {
    return (
      <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
          {queryHistory.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Recent Queries</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All
                </Button>
              </div>
              {queryHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-sm transition-all hover:border-blue-200 dark:hover:border-blue-800">
                    <CardContent className="p-2 md:p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-300">
                            {formatTimestamp(item.timestamp)}
                          </span>
                          <Badge
                            variant={
                              item.status === "success"
                                ? "outline"
                                : "destructive"
                            }
                            className={cn(
                              "ml-1 text-xs py-0 px-1.5",
                              item.status === "success" &&
                                "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                            )}
                          >
                            {item.status === "success" ? (
                              <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                            ) : (
                              <AlertCircle className="h-2.5 w-2.5 mr-1" />
                            )}
                            {item.status}
                          </Badge>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setQuery(item.query);
                                toast.success("Query Loaded", {
                                  description: "Query loaded into editor",
                                });
                              }}
                              className="h-6 w-6 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Load query into editor
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg overflow-x-auto font-mono max-h-16 overflow-y-auto">
                        <code>{item.query}</code>
                      </pre>
                      {item.status === "success" && (
                        <div className="flex gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className="text-xs bg-slate-100 dark:bg-slate-800 py-0 px-1.5"
                          >
                            {item.executionTime}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs bg-slate-100 dark:bg-slate-800 py-0 px-1.5"
                          >
                            {item.rowCount} rows
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <History className="h-8 w-8 text-slate-400 mb-2" />
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No query history yet
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your executed queries will appear here
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 ring-2 ring-white/10 dark:ring-black/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Database className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
                  Trino Query Explorer
                </h1>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
                  Write, execute, and analyze your data with SQL
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Badge className="bg-emerald-100 text-emerald-700 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-emerald-200 text-xs md:text-sm dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected to S3
                </div>
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Settings className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Metadata
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Switch Branch
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Filter className="h-4 w-4 mr-2" />
                    Query Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
          {/* Main Editor */}
          <Card
            className={cn(
              "border-none shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 overflow-hidden transition-all duration-300",
              isEditorMaximized ? "lg:col-span-4" : "lg:col-span-3"
            )}
          >
            <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.span
                    className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-inner"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Terminal className="h-4 w-4 md:h-5 md:w-5" />
                  </motion.span>
                  <div>
                    <CardTitle className="text-sm md:text-base">
                      Query Editor
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Write and execute Trino SQL queries
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          copyToClipboard(query, "Query copied to clipboard");
                        }}
                      >
                        <Copy className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Copy</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy query to clipboard</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          toast.info("AI Assist Coming Soon", {
                            description:
                              "This feature will be available in the next release",
                          });
                        }}
                      >
                        <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                        <span className="hidden sm:inline">AI Assist</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Get AI assistance with your query
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsEditorMaximized(!isEditorMaximized)}
                      >
                        {isEditorMaximized ? (
                          <Minimize2 className="h-3 w-3 md:h-4 md:w-4" />
                        ) : (
                          <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                        )}
                        <span className="hidden sm:inline">
                          {isEditorMaximized ? "Restore" : "Maximize"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isEditorMaximized ? "Restore layout" : "Maximize editor"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 relative h-[300px] md:h-[400px]">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={query}
                onChange={(value) => setQuery(value || "")}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 },
                  fontFamily: "'JetBrains Mono', monospace",
                  wordWrap: "on",
                  renderWhitespace: "selection",
                  suggest: {
                    preview: true,
                  },
                  quickSuggestions: true,
                }}
              />
            </CardContent>

            <CardFooter className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-3 md:p-4">
              <div className="flex flex-col w-full gap-3">
                <div className="flex items-center gap-2 md:gap-3 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={executeQuery}
                        disabled={queryState.status === "executing"}
                        className={cn(
                          "gap-2 shadow-lg transition-all flex-1 sm:flex-none",
                          queryState.status === "executing"
                            ? "bg-amber-500 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-600"
                            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800"
                        )}
                        size="sm"
                      >
                        {queryState.status === "executing" ? (
                          <>
                            <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                            <span className="hidden sm:inline">
                              Executing...
                            </span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Run Query</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Execute SQL query</TooltipContent>
                  </Tooltip>

                  {results?.status === "success" && (
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadResults("csv")}
                            className="gap-2"
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">CSV</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download results as CSV</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadResults("json")}
                            className="gap-2"
                          >
                            <Download className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">JSON</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Download results as JSON
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {queryState.status === "executing" && (
                    <div className="flex-1 flex items-center gap-3">
                      <Progress
                        value={queryState.progress}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[32px] text-right">
                        {queryState.progress?.toFixed(0)}%
                      </span>
                    </div>
                  )}

                  {results && queryState.status !== "executing" && (
                    <div className="ml-auto flex items-center gap-2 md:gap-3">
                      {results.status === "success" ? (
                        <>
                          <Badge
                            variant="outline"
                            className="bg-slate-100 gap-1 text-xs dark:bg-slate-800"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {results.rowCount} rows
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-xs dark:bg-slate-800"
                          >
                            {results.executionTime}
                          </Badge>
                        </>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          Query Failed
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Sidebar */}
          {!isEditorMaximized && (
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as "schema" | "examples" | "history")
                }
                className="h-full flex flex-col"
              >
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-3 md:p-4">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 h-9 md:h-10">
                    <TabsTrigger
                      value="schema"
                      className="gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 text-xs md:text-sm"
                    >
                      <Database className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Schema</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="examples"
                      className="gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 text-xs md:text-sm"
                    >
                      <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">Examples</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="gap-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 text-xs md:text-sm"
                    >
                      <History className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden sm:inline">History</span>
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-hidden">
                  <TabsContent value="schema" className="m-0 h-full">
                    {renderSchemaExplorer()}
                  </TabsContent>

                  <TabsContent value="examples" className="m-0 h-full">
                    {renderExampleQueries()}
                  </TabsContent>

                  <TabsContent value="history" className="m-0 h-full">
                    {renderQueryHistory()}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`mt-1 md:mt-6 border-none shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 transition-all duration-300 ${
                isResultsCollapsed ? "max-h-[80px] overflow-hidden" : ""
              }`}
            >
              <CardHeader
                className="m-1 cursor-pointer"
                onClick={() => setIsResultsCollapsed(!isResultsCollapsed)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-inner"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <Table2 className="h-4 w-4 md:h-5 md:w-5" />
                    </motion.span>
                    <div>
                      <CardTitle className="text-sm md:text-base">
                        Query Results
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        {results.status === "success"
                          ? `${results.rowCount} rows • ${results.executionTime}`
                          : results.error}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsResultsCollapsed(!isResultsCollapsed);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: isResultsCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </div>
              </CardHeader>

              {!isResultsCollapsed && (
                <CardContent className="p-0">
                  {results.status === "success" ? (
                    <>
                      {results.stats && (
                        <div className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <motion.div
                              className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                              whileHover={{
                                y: -2,
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                            >
                              <Cpu className="h-4 w-4 text-blue-500" />
                              <span>CPU: {results.stats.cpu}</span>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                              whileHover={{
                                y: -2,
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                            >
                              <MemoryStick className="h-4 w-4 text-purple-500" />
                              <span>Memory: {results.stats.memory}</span>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                              whileHover={{
                                y: -2,
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                            >
                              <Server className="h-4 w-4 text-green-500" />
                              <span>
                                Rows:{" "}
                                {new Intl.NumberFormat().format(
                                  results.stats.processedRows
                                )}
                              </span>
                            </motion.div>
                            <motion.div
                              className="flex items-center gap-2 text-sm bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                              whileHover={{
                                y: -2,
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                              }}
                            >
                              <HardDrive className="h-4 w-4 text-amber-500" />
                              <span>
                                Data:{" "}
                                {formatBytes(results.stats.processedBytes)}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      <div className="overflow-x-auto max-h-[500px]">
                        <Table>
                          <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                            <TableRow>
                              {results.columns.map((column, index) => (
                                <TableHead
                                  key={index}
                                  className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap"
                                >
                                  {column}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.rows.map((row, rowIndex) => (
                              <TableRow
                                key={rowIndex}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                              >
                                {row.map((cell, cellIndex) => (
                                  <TableCell
                                    key={cellIndex}
                                    className="font-mono text-xs max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                                  >
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-default">
                                          {typeof cell === "string" &&
                                          cell.length > 50
                                            ? `${cell.substring(0, 50)}...`
                                            : cell}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-md">
                                        {cell}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 md:p-8 text-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <AlertCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto text-red-500 mb-3 md:mb-4" />
                      </motion.div>
                      <h3 className="text-base md:text-lg font-medium text-red-700 dark:text-red-400 mb-1 md:mb-2">
                        Query Execution Failed
                      </h3>
                      <p className="text-sm text-slate-500 max-w-md mx-auto mb-3 md:mb-4">
                        {results.error}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setResults(null)}
                        className="gap-2"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
