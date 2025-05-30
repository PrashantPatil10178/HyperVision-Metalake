"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, RefreshCw, Check } from "lucide-react";

interface SchemaSearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterOptions: {
    showAdded: boolean;
    showRemoved: boolean;
    showModified: boolean;
    showUnchanged: boolean;
  };
  onFilterChange: (options: any) => void;
}

export function SchemaSearchFilter({
  searchTerm,
  onSearchChange,
  filterOptions,
  onFilterChange,
}: SchemaSearchFilterProps) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search fields by name, type, or ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-added"
                checked={filterOptions.showAdded}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, showAdded: !!checked })
                }
              />
              <Label
                htmlFor="show-added"
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[oklch(0.5_0.2_140)]" />
                Added
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-removed"
                checked={filterOptions.showRemoved}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, showRemoved: !!checked })
                }
              />
              <Label
                htmlFor="show-removed"
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5 text-[oklch(0.5_0.2_30)]" />
                Removed
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-modified"
                checked={filterOptions.showModified}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, showModified: !!checked })
                }
              />
              <Label
                htmlFor="show-modified"
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[oklch(0.5_0.2_280)]" />
                Modified
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-unchanged"
                checked={filterOptions.showUnchanged}
                onCheckedChange={(checked) =>
                  onFilterChange({ ...filterOptions, showUnchanged: !!checked })
                }
              />
              <Label
                htmlFor="show-unchanged"
                className="flex items-center gap-1 text-sm cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
                Unchanged
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
