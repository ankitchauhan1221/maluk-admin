import React from 'react';

const CouponSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="md:ml-64 p-4 md:p-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
        </div>

        {/* Coupon Cards Skeleton */}
        <div className="grid gap-4 md:gap-6">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-4 w-48 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-4 w-36 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="text-right w-full sm:w-auto space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CouponSkeleton;