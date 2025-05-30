/**
 * Delta Table Metadata Types
 */

// Base metadata interface
export interface DeltaTableMetadata {
  tableId: string;
  formatVersion: string;
  location: string;
  createdAt: number;
  lastModified: number;
  name?: string;
  description?: string;
  owner?: string;
  format?: {
    provider: string;
    options: Record<string, any>;
  };
  schema?: {
    fields: DeltaTableField[];
  };
  partitionColumns?: string[];
  properties?: Record<string, string>;
}

// Field definition
export interface DeltaTableField {
  id?: number;
  name: string;
  type: string;
  required: boolean;
  doc?: string;
  nullable?: boolean;
  metadata?: Record<string, any>;
}

// Version history
export interface DeltaTableVersion {
  version: number;
  timestamp: string;
  operation: string;
  operationParameters: Record<string, any>;
  isCurrent: boolean;
  numFiles: number;
  numRecords: number;
  numAddedFiles: number;
  numRemovedFiles: number;
  sizeBytes: number;
}

// Delta properties
export interface DeltaProperties {
  [key: string]: string;
}
