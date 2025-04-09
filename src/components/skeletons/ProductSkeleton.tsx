
const ProductSkeleton = () => {
    return (
      <tr className="border-b animate-pulse">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </td>
        <td className="px-6 py-4">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </td>
      </tr>
    );
  };
  
  export default ProductSkeleton;
  