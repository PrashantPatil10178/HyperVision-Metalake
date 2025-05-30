import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="flex h-screen">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-gray-100 dark:bg-gray-900 p-4">
        <Skeleton className="h-8 w-40 mb-6" /> {/* Logo */}
        <Skeleton className="h-10 w-full mb-4" /> {/* Search */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-3/4" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 p-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>

        {/* Growth Metrics Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-48 w-full" />
        </div>

        {/* Format Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-48 w-48 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
