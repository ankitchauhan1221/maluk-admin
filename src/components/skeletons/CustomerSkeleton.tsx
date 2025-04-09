import { Skeleton } from "../ui/skeleton";

export const CustomerSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-2 mt-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
        </div>
        <div className="text-right space-y-4">
          <div className="flex items-center gap-3 mb-2 justify-end">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="w-8 h-4 rounded-full" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full ml-auto" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>
    </div>
  );
};