"use client";

import { useEffect, useState } from "react";
import { DeltaVersionSelector } from "./delta-version-selector";
import { DeltaSchemaViewer } from "./DeltaSchemaViewer";
import { DeltaTableProperties } from "./DeltaTableProperties";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import useUser from "@/hooks/useUser";
import api from "@/services/AxiosInterceptor";

// Define types for Delta Table metadata
interface DeltaTableMetadata {
  "current-snapshot-id"?: number;
  "default-spec-id"?: number;
  "format-version"?: number;
  "last-column-id"?: number;
  "last-partition-id"?: number;
  "last-updated-ms"?: number;
  location?: string;
  manifests?: any[];
  "partition-specs"?: any[];
  schemas?: any[];
  snapshots?: any[];
  "table-uuid"?: string;
  [key: string]: any; // Allow for additional properties
}

export default function Home({ selectedTable }: { selectedTable: string }) {
  const [metadata, setMetadata] = useState<DeltaTableMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: userData } = useUser();

  useEffect(() => {
    const fetchDeltaMetadata = async () => {
      try {
        setLoading(true);

        const response = await api.post("delta/data", {
          bucketName: userData?.buckets[0].name,
          location: selectedTable,
        });

        console.log("Response", response, "I am at the DElta Center");
        const data = response.data;
        setMetadata(data);
      } catch (err) {
        console.error("Error fetching Delta metadata:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");

        // Fallback to sample metadata for development/testing
        setMetadata({
          "current-snapshot-id": 0,
          "default-spec-id": 0,
          "format-version": 1,
          "last-column-id": 19,
          "last-partition-id": 0,
          "last-updated-ms": 1741694238237,
          location: "s3://delta-lake-project-dem0/delta-lake-resources",
          manifests: [
            {
              "column-sizes": null,
              content: 0,
              "file-format": "PARQUET",
              "file-path":
                "part-00000-95f8bf02-ff9a-4b72-be28-12e7b1730768-c000.snappy.parquet",
              "file-size-in-bytes": 12304,
              "key-metadata": null,
              "lower-bounds": null,
              "nan-value-counts": null,
              "null-value-counts": null,
              partition: {},
              "record-count": null,
              "sort-order-id": 0,
              "split-offsets": [],
              "upper-bounds": null,
              "value-counts": null,
            },
          ],
          "partition-specs": [
            {
              fields: [],
              "spec-id": 0,
            },
          ],
          schemas: [
            {
              fields: [
                {
                  id: 1,
                  metadata: {},
                  name: "vendorid",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 2,
                  metadata: {},
                  name: "tpep_pickup_datetime",
                  nullable: true,
                  type: "timestamp",
                },
                {
                  id: 3,
                  metadata: {},
                  name: "tpep_dropoff_datetime",
                  nullable: true,
                  type: "timestamp",
                },
                {
                  id: 4,
                  metadata: {},
                  name: "passenger_count",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 5,
                  metadata: {},
                  name: "trip_distance",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 6,
                  metadata: {},
                  name: "ratecodeid",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 7,
                  metadata: {},
                  name: "store_and_fwd_flag",
                  nullable: true,
                  type: "string",
                },
                {
                  id: 8,
                  metadata: {},
                  name: "pulocationid",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 9,
                  metadata: {},
                  name: "dolocationid",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 10,
                  metadata: {},
                  name: "payment_type",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 11,
                  metadata: {},
                  name: "fare_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 12,
                  metadata: {},
                  name: "extra",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 13,
                  metadata: {},
                  name: "mta_tax",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 14,
                  metadata: {},
                  name: "tip_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 15,
                  metadata: {},
                  name: "tolls_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 16,
                  metadata: {},
                  name: "improvement_surcharge",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 17,
                  metadata: {},
                  name: "total_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 18,
                  metadata: {},
                  name: "congestion_surcharge",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 19,
                  metadata: {},
                  name: "airport_fee",
                  nullable: true,
                  type: "double",
                },
              ],
              "identifier-field-ids": [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19,
              ],
              "schema-id": 0,
              type: "struct",
            },
          ],
          snapshots: [
            {
              "manifest-list": "virtual",
              "schema-id": 0,
              "snapshot-id": 0,
              summary: {
                operation: "WRITE",
              },
              "timestamp-ms": 1741694238237,
            },
          ],
          "table-uuid": "unknown",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeltaMetadata();
  }, []);

  useEffect(() => {
    const fetchDeltaMetadata = async () => {
      try {
        setLoading(true);

        const response = await api.post("delta/data", {
          bucketName: userData?.buckets[0].name,
          location: selectedTable,
        });

        console.log("Response", response, "I am at the DElta Center");
        const data = response.data;
        setMetadata(data);
      } catch (err) {
        console.error("Error fetching Delta metadata:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");

        // Fallback to sample metadata for development/testing
        setMetadata({
          "current-snapshot-id": 0,
          "default-spec-id": 0,
          "format-version": 1,
          "last-column-id": 19,
          "last-partition-id": 0,
          "last-updated-ms": 1741694238237,
          location: "s3://delta-lake-project-dem0/delta-lake-resources",
          manifests: [
            {
              "column-sizes": null,
              content: 0,
              "file-format": "PARQUET",
              "file-path":
                "part-00000-95f8bf02-ff9a-4b72-be28-12e7b1730768-c000.snappy.parquet",
              "file-size-in-bytes": 12304,
              "key-metadata": null,
              "lower-bounds": null,
              "nan-value-counts": null,
              "null-value-counts": null,
              partition: {},
              "record-count": null,
              "sort-order-id": 0,
              "split-offsets": [],
              "upper-bounds": null,
              "value-counts": null,
            },
          ],
          "partition-specs": [
            {
              fields: [],
              "spec-id": 0,
            },
          ],
          schemas: [
            {
              fields: [
                {
                  id: 1,
                  metadata: {},
                  name: "vendorid",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 2,
                  metadata: {},
                  name: "tpep_pickup_datetime",
                  nullable: true,
                  type: "timestamp",
                },
                {
                  id: 3,
                  metadata: {},
                  name: "tpep_dropoff_datetime",
                  nullable: true,
                  type: "timestamp",
                },
                {
                  id: 4,
                  metadata: {},
                  name: "passenger_count",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 5,
                  metadata: {},
                  name: "trip_distance",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 6,
                  metadata: {},
                  name: "ratecodeid",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 7,
                  metadata: {},
                  name: "store_and_fwd_flag",
                  nullable: true,
                  type: "string",
                },
                {
                  id: 8,
                  metadata: {},
                  name: "pulocationid",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 9,
                  metadata: {},
                  name: "dolocationid",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 10,
                  metadata: {},
                  name: "payment_type",
                  nullable: true,
                  type: "long",
                },
                {
                  id: 11,
                  metadata: {},
                  name: "fare_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 12,
                  metadata: {},
                  name: "extra",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 13,
                  metadata: {},
                  name: "mta_tax",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 14,
                  metadata: {},
                  name: "tip_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 15,
                  metadata: {},
                  name: "tolls_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 16,
                  metadata: {},
                  name: "improvement_surcharge",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 17,
                  metadata: {},
                  name: "total_amount",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 18,
                  metadata: {},
                  name: "congestion_surcharge",
                  nullable: true,
                  type: "double",
                },
                {
                  id: 19,
                  metadata: {},
                  name: "airport_fee",
                  nullable: true,
                  type: "double",
                },
              ],
              "identifier-field-ids": [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
                19,
              ],
              "schema-id": 0,
              type: "struct",
            },
          ],
          snapshots: [
            {
              "manifest-list": "virtual",
              "schema-id": 0,
              "snapshot-id": 0,
              summary: {
                operation: "WRITE",
              },
              "timestamp-ms": 1741694238237,
            },
          ],
          "table-uuid": "unknown",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeltaMetadata();
  }, [selectedTable]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#20a7b6]" />
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">
            Failed to load Delta table metadata
          </p>
          {error && <p className="text-sm text-destructive">Error: {error}</p>}
        </div>
      </div>
    );
  }

  // Convert Delta metadata to a format compatible with existing components
  const adaptedMetadata = {
    tableId: metadata["table-uuid"] || "unknown",
    formatVersion: String(metadata["format-version"] || "1"),
    location: metadata.location || "unknown",
    createdAt: metadata["last-updated-ms"] || Date.now(),
    lastModified: metadata["last-updated-ms"] || Date.now(),
    name: metadata.location ? metadata.location.split("/").pop() : "unknown",
    description: "Delta table",
    owner: "data-team",
    format: {
      provider: "parquet",
      options: {
        compression: "snappy",
      },
    },
    schema: {
      fields:
        metadata.schemas?.[0]?.fields?.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          required: !field.nullable,
          doc: field.metadata?.description || "",
        })) || [],
    },
    partitionColumns:
      metadata["partition-specs"]?.[0]?.fields?.map((f: any) => f.name) || [],
    properties: {
      "delta.minReaderVersion": String(metadata["format-version"] || "1"),
      "delta.minWriterVersion": String(metadata["format-version"] || "1"),
      "delta.columnMapping.mode": "none",
      "delta.checkpointInterval": "10",
      "delta.enableChangeDataFeed": "true",
      "delta.autoOptimize.optimizeWrite": "true",
    },
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#20a7b6]">
          Delta Table Explorer
        </h1>
        <p className="text-muted-foreground">
          Viewing table:{" "}
          {metadata.location ? metadata.location.split("/").pop() : "unknown"}
          {error && (
            <span className="text-amber-500 ml-2">
              (Using fallback data: {error})
            </span>
          )}
        </p>
      </div>

      <Tabs defaultValue="versions" className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        <TabsContent value="versions">
          <DeltaVersionSelector metadata={metadata} />
        </TabsContent>

        <TabsContent value="schema">
          <DeltaSchemaViewer metadata={adaptedMetadata} />
        </TabsContent>

        <TabsContent value="properties">
          <DeltaTableProperties metadata={adaptedMetadata} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
