import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useUser from "@/hooks/useUser";
import { useTableList } from "@/hooks/useTableList";

interface TableSelectorProps {
  selectedTable: string;
  onSelectTable: (table: string) => void;
  setSelectedTable: (table: string) => void;
  setFormat: (format: string) => void;
}

export function TableSelector({
  selectedTable,
  onSelectTable,
  setSelectedTable,
  setFormat,
}: TableSelectorProps) {
  const [open, setOpen] = useState(false);
  const { data: userData } = useUser();
  const bucketName = userData?.buckets?.[0]?.name;

  const { data: tables, isLoading } = useTableList(bucketName);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[320px] justify-between text-left"
        >
          {isLoading ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : selectedTable && tables ? (
            tables.find((table) => table.value === selectedTable)?.displayLabel
          ) : (
            "Select table..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Search tables..." className="w-full" />
            <CommandList>
              <CommandEmpty>No table found.</CommandEmpty>
              <CommandGroup>
                {tables?.map((table) => (
                  <CommandItem
                    key={table.value}
                    value={table.value}
                    onSelect={(currentValue) => {
                      onSelectTable(currentValue);
                      setSelectedTable(table.value);

                      // Extract format properly
                      const formatMatch = table.label.match(/\(([^)]+)\)/);
                      console.log("Format Match:", formatMatch);

                      const format = formatMatch ? formatMatch[1] : "UNKNOWN"; // Extract "delta", "iceberg", etc.
                      setFormat(format);
                      localStorage.setItem("format", format); // Store format in local storage

                      setOpen(false);
                    }}
                    className="whitespace-normal break-words"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTable === table.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {table.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
