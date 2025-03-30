import type React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LayoutDashboard,
  Package,
  Database,
  Table2,
  Layers,
  FileText,
  BarChart3,
  Terminal,
  FileBarChart,
  Settings,
  ChartLine,
} from "lucide-react";
import { motion } from "framer-motion";
import useUser from "@/hooks/useUser";
import { account } from "@/lib/appwrite";
import { useTableList } from "@/hooks/useTableList";

export function AppSidebar({
  activeTab,
  setActiveTab,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { data: userData } = useUser();
  const { data: tableList, isLoading: isTableLoading } = useTableList(
    userData?.buckets[0].name
  );
  const format = localStorage.getItem("format") || "iceberg";

  const renderTableAnalysisMenu = () => {
    switch (format.toLowerCase()) {
      case "iceberg":
        return (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "tables"}
                onClick={() => setActiveTab("tables")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_200/0.2)] text-[oklch(0.5_0.2_200)] group-hover:bg-[oklch(0.9_0.1_200/0.3)]">
                    <Database className="h-3.5 w-3.5" />
                  </div>
                  <span>Tables</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "schema"}
                onClick={() => setActiveTab("schema")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_140/0.2)] text-[oklch(0.5_0.2_140)] group-hover:bg-[oklch(0.9_0.1_140/0.3)]">
                    <Table2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Schema</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "partitions"}
                onClick={() => setActiveTab("partitions")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_30/0.2)] text-[oklch(0.5_0.2_30)] group-hover:bg-[oklch(0.9_0.1_30/0.3)]">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <span>Partitions</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "Comparison"}
                onClick={() => setActiveTab("Comparison")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_30/0.2)] text-[oklch(0.5_0.2_30)] group-hover:bg-[oklch(0.9_0.1_30/0.3)]">
                    <ChartLine className="h-3.5 w-3.5" />
                  </div>
                  <span>Metadata Comparison</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        );
      case "hudi":
        return (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "hudiDetails"}
                onClick={() => setActiveTab("hudiDetails")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_30/0.2)] text-[oklch(0.5_0.2_30)] group-hover:bg-[oklch(0.9_0.1_30/0.3)]">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <span>Hudi Details</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        );
      case "parquet":
        return (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={activeTab === "parquetDetails"}
              onClick={() => setActiveTab("parquetDetails")}
              className="group"
            >
              <button>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_200/0.2)] text-[oklch(0.5_0.2_200)] group-hover:bg-[oklch(0.9_0.1_200/0.3)]">
                  <Database className="h-3.5 w-3.5" />
                </div>
                <span>Parquet Details</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      default: // For Delta
        return (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={activeTab === "deltaDetails"}
              onClick={() => setActiveTab("deltaDetails")}
              className="group"
            >
              <button>
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_200/0.2)] text-[oklch(0.5_0.2_200)] group-hover:bg-[oklch(0.9_0.1_200/0.3)]">
                  <Database className="h-3.5 w-3.5" />
                </div>
                <span>Delta Details</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
    }
  };

  return (
    <Sidebar
      className="border-r border-border/40 bg-background/50 backdrop-blur-sm"
      {...props}
    >
      <SidebarHeader className="flex items-center px-6 py-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.6_0.2_280)] to-[oklch(0.6_0.2_240)] text-primary-foreground">
            <Package className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-[oklch(0.6_0.2_280)] to-[oklch(0.6_0.2_240)] bg-clip-text text-transparent">
            Metalake
          </span>
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tables..."
              className="w-full pl-9 bg-background/50"
            />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Overview
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
                className="group"
              >
                <button>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary group-hover:bg-primary/20">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <span>Dashboard</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
                className="group"
              >
                <button>
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] group-hover:bg-[oklch(0.9_0.1_280/0.3)]">
                    <Package className="h-4 w-4" />
                  </div>
                  <span>Bucket Overview</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Table Analysis
          </SidebarGroupLabel>
          <SidebarMenu>{renderTableAnalysisMenu()}</SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Version Control
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "versions"}
                onClick={() => setActiveTab("versions")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] group-hover:bg-[oklch(0.9_0.1_280/0.3)]">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span>Version History</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "metrics"}
                onClick={() => setActiveTab("metrics")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_200/0.2)] text-[oklch(0.5_0.2_200)] group-hover:bg-[oklch(0.9_0.1_200/0.3)]">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  <span>Storage Metrics</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Query Tools
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activeTab === "trino"}
                onClick={() => setActiveTab("trino")}
                className="group"
              >
                <button>
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] group-hover:bg-[oklch(0.9_0.1_280/0.3)]">
                    <Terminal className="h-3.5 w-3.5" />
                  </div>
                  <span>Trino Query Editor</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
            Recent Tables
          </SidebarGroupLabel>
          <SidebarMenu>
            {tableList?.map((table) => {
              // Extract format from the label (e.g., "(parquet)", "(delta)", etc.)
              const formatMatch = table.label.match(/\((\w+)\)/);
              const format = formatMatch
                ? formatMatch[1].toLowerCase()
                : "unknown";

              // Get icon color based on format
              let iconColor = "";
              switch (format) {
                case "iceberg":
                  iconColor =
                    "bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] group-hover:bg-[oklch(0.9_0.1_280/0.3)]";
                  break;
                case "delta":
                  iconColor =
                    "bg-[oklch(0.9_0.1_200/0.2)] text-[oklch(0.5_0.2_200)] group-hover:bg-[oklch(0.9_0.1_200/0.3)]";
                  break;
                case "hudi":
                  iconColor =
                    "bg-[oklch(0.9_0.1_140/0.2)] text-[oklch(0.5_0.2_140)] group-hover:bg-[oklch(0.9_0.1_140/0.3)]";
                  break;
                case "parquet":
                  iconColor =
                    "bg-[oklch(0.9_0.1_30/0.2)] text-[oklch(0.5_0.2_30)] group-hover:bg-[oklch(0.9_0.1_30/0.3)]";
                  break;
                default:
                  iconColor =
                    "bg-[oklch(0.9_0.1_280/0.2)] text-[oklch(0.5_0.2_280)] group-hover:bg-[oklch(0.9_0.1_280/0.3)]";
              }

              return (
                <SidebarMenuItem key={table.value}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === table.value}
                    onClick={() => setActiveTab(table.value)}
                    className="group"
                  >
                    <button>
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded ${iconColor}`}
                      >
                        <FileBarChart className="h-3.5 w-3.5" />
                      </div>
                      <span>
                        {table.displayLabel} ({format})
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>{"M"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {userData?.name || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground">
                {userData?.email || "JohnCena@anonymous.com"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => account.deleteSession("current")}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
