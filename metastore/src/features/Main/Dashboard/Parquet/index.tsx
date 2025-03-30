"use client";

import { useState, useEffect } from "react";
import { ParquetTableProperties } from "./ParquetTableProperties";
import { ParquetSchemaViewer } from "./ParquetSchemaViewer";
import { ParquetFileViewer } from "./ParquetFileViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Demo data that matches the expected structure for all components
const demoData = {
  table_name: "customer_orders",
  s3_location: "s3://hackathone6data/data.parquet",
  total_rows: 1250000,
  total_files: 12,
  last_updated: "2023-12-15T14:30:00Z",
  schema: {
    fields: [
      { name: "order_id", type: "string", nullable: false },
      { name: "customer_id", type: "string", nullable: false },
      { name: "order_date", type: "timestamp", nullable: false },
      { name: "product_id", type: "string", nullable: false },
      { name: "quantity", type: "integer", nullable: false },
      { name: "price", type: "decimal(10,2)", nullable: false },
      { name: "discount", type: "decimal(5,2)", nullable: true },
      { name: "shipping_address", type: "string", nullable: true },
      { name: "payment_method", type: "string", nullable: true },
      { name: "status", type: "string", nullable: false },
    ],
  },
  partitions: [
    {
      s3_path:
        "s3://hackathone6data/data.parquet/year=2023/month=12/part-00000.parquet",
      file_size_bytes: 52428800,
      row_count: 125000,
      num_row_groups: 4,
      compression: "SNAPPY",
      last_modified: "2023-12-15T14:30:00Z",
      partition_values: {
        year: "2023",
        month: "12",
      },
      column_statistics: {
        order_id: { min: "ORD100000", max: "ORD199999", null_count: 0 },
        customer_id: { min: "CUST10000", max: "CUST99999", null_count: 0 },
        price: { min: "5.99", max: "1299.99", null_count: 0 },
        discount: { min: "0.00", max: "25.00", null_count: 1250 },
      },
    },
    {
      s3_path:
        "s3://hackathone6data/data.parquet/year=2023/month=11/part-00000.parquet",
      file_size_bytes: 48234567,
      row_count: 118500,
      num_row_groups: 4,
      compression: "SNAPPY",
      last_modified: "2023-11-30T23:15:00Z",
      partition_values: {
        year: "2023",
        month: "11",
      },
      column_statistics: {
        order_id: { min: "ORD090000", max: "ORD099999", null_count: 0 },
        customer_id: { min: "CUST08000", max: "CUST89999", null_count: 0 },
        price: { min: "4.99", max: "1199.99", null_count: 0 },
        discount: { min: "0.00", max: "30.00", null_count: 980 },
      },
    },
    {
      s3_path:
        "s3://hackathone6data/data.parquet/year=2023/month=10/part-00000.parquet",
      file_size_bytes: 45678912,
      row_count: 110000,
      num_row_groups: 3,
      compression: "SNAPPY",
      last_modified: "2023-10-31T22:45:00Z",
      partition_values: {
        year: "2023",
        month: "10",
      },
      column_statistics: {
        order_id: { min: "ORD080000", max: "ORD089999", null_count: 0 },
        customer_id: { min: "CUST07000", max: "CUST79999", null_count: 0 },
        price: { min: "3.99", max: "999.99", null_count: 0 },
        discount: { min: "0.00", max: "20.00", null_count: 850 },
      },
    },
  ],
};

const fetchParquetData = async (tableName: string) => {
  console.log(`Fetching data for table: ${tableName}`);

  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve(demoData);
    }, 1000);
  });
};

export default function ParquetViewer() {
  const [metadata, setMetadata] = useState<any>(demoData);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await fetchParquetData(metadata.table_name);
      setMetadata(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    // Data is already loaded with demo data
    // In a real app, you might want to fetch from API on initial load
    // refreshData();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parquet Table Viewer</h1>
        <Button
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="properties">Table Properties</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <ParquetTableProperties metadata={metadata} />
        </TabsContent>

        <TabsContent value="schema">
          <ParquetSchemaViewer metadata={metadata} />
        </TabsContent>

        <TabsContent value="files">
          <ParquetFileViewer metadata={metadata} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
