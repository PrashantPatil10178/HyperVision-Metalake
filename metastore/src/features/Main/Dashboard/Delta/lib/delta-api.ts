import type {
  DeltaTableMetadata,
  DeltaTableVersion,
} from "@/types/delta-table";

/**
 * Mock API for fetching Delta Table metadata
 * In a real application, this would make actual API calls
 */

// Demo data for Delta Table metadata
const demoMetadata: DeltaTableMetadata = {
  tableId: "f79d3b8e-708b-4e18-b011-8c7a4d3a8c1d",
  formatVersion: "1",
  location: "s3://my-bucket/delta-tables/customers",
  createdAt: 1672531200000,
  lastModified: 1678901234000,
  name: "customers",
  description: "Customer data table",
  owner: "data-team",
  format: {
    provider: "parquet",
    options: {
      compression: "snappy",
    },
  },
  schema: {
    fields: [
      { id: 1, name: "id", type: "long", required: true, doc: "Primary key" },
      {
        id: 2,
        name: "name",
        type: "string",
        required: false,
        doc: "Customer name",
      },
      {
        id: 3,
        name: "email",
        type: "string",
        required: false,
        doc: "Email address",
      },
      {
        id: 4,
        name: "created_at",
        type: "timestamp",
        required: false,
        doc: "Creation time",
      },
      {
        id: 5,
        name: "updated_at",
        type: "timestamp",
        required: false,
        doc: "Last update time",
      },
      {
        id: 6,
        name: "is_active",
        type: "boolean",
        required: false,
        doc: "Active status",
      },
    ],
  },
  partitionColumns: ["created_at"],
  properties: {
    "delta.minReaderVersion": "1",
    "delta.minWriterVersion": "2",
    "delta.columnMapping.mode": "none",
    "delta.checkpointInterval": "10",
    "delta.enableChangeDataFeed": "true",
    "delta.autoOptimize.optimizeWrite": "true",
  },
};

// Demo data for Delta Table versions
export const demoVersions: DeltaTableVersion[] = [
  {
    version: 3,
    timestamp: "2023-11-15T10:30:00Z",
    operation: "MERGE",
    operationParameters: { predicate: "id > 1000" },
    isCurrent: true,
    numFiles: 42,
    numRecords: 125000,
    numAddedFiles: 12,
    numRemovedFiles: 3,
    sizeBytes: 456789012,
  },
  {
    version: 2,
    timestamp: "2023-11-14T15:45:00Z",
    operation: "UPDATE",
    operationParameters: { condition: "status = 'active'" },
    isCurrent: false,
    numFiles: 33,
    numRecords: 98000,
    numAddedFiles: 8,
    numRemovedFiles: 2,
    sizeBytes: 321456789,
  },
  {
    version: 1,
    timestamp: "2023-11-13T09:15:00Z",
    operation: "WRITE",
    operationParameters: { mode: "Overwrite" },
    isCurrent: false,
    numFiles: 25,
    numRecords: 75000,
    numAddedFiles: 25,
    numRemovedFiles: 0,
    sizeBytes: 234567890,
  },
  {
    version: 0,
    timestamp: "2023-11-12T08:00:00Z",
    operation: "CREATE TABLE",
    operationParameters: {},
    isCurrent: false,
    numFiles: 0,
    numRecords: 0,
    numAddedFiles: 0,
    numRemovedFiles: 0,
    sizeBytes: 0,
  },
];

/**
 * Fetch Delta Table metadata
 * @param tableId Optional table ID
 * @returns Promise with table metadata
 */
export async function fetchDeltaTableMetadata(
  tableId?: string
): Promise<DeltaTableMetadata> {
  // In a real app, this would make an API call
  // For demo purposes, we'll just return the demo data after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(demoMetadata);
    }, 500);
  });
}

/**
 * Fetch Delta Table versions
 * @param tableId Table ID
 * @returns Promise with table versions
 */
export async function fetchDeltaTableVersions(
  tableId: string
): Promise<DeltaTableVersion[]> {
  // In a real app, this would make an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(demoVersions);
    }, 500);
  });
}
