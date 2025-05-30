import { useQuery } from "@tanstack/react-query";
import api from "@/services/AxiosInterceptor"; // Adjust the import according to your project structure

interface TableResponseItem {
  table: string;
  format: string;
}

interface FormattedTable {
  value: string;
  label: string;
  displayLabel: string;
}

const formatTableName = (table: string, format: string) => {
  const cleanedTableName = table
    .replace(/^(delta_|iceberg_|dummy_hudi_)/, "")
    .replace(/-[a-f0-9]{32}$/, "");
  return {
    fullLabel: `${cleanedTableName} (${format})`,
    displayLabel: cleanedTableName,
  };
};

const fetchTables = async (
  bucketName: string | undefined
): Promise<FormattedTable[]> => {
  if (!bucketName) throw new Error("Bucket name is required");

  const response = await api.post("/users/listTables", { bucketName });
  return response.data.map((item: TableResponseItem) => {
    const { fullLabel, displayLabel } = formatTableName(
      item.table,
      item.format
    );
    return {
      value: item.table,
      label: fullLabel,
      displayLabel,
    };
  });
};

export const useTableList = (bucketName?: string) => {
  return useQuery({
    queryKey: ["tables", bucketName],
    queryFn: () => fetchTables(bucketName),
    enabled: !!bucketName, // Ensures the query runs only when bucketName is available
  });
};
