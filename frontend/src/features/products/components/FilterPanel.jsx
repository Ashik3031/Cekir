import React from "react";

const FilterPanel = ({ filters, setFilters }) => {
  const handleFilterChange = (filterKey, value) => {
    setFilters({ ...filters, [filterKey]: value });
  };

  return (
    <aside className="w-1/4 bg-gray-100 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Filters</h3>
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Price</label>
          <select
            className="w-full px-4 py-2 border rounded"
            onChange={(e) => handleFilterChange("price", e.target.value)}
          >
            <option value="">Select</option>
            <option value="lowToHigh">Low to High</option>
            <option value="highToLow">High to Low</option>
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Sort By</label>
          <select
            className="w-full px-4 py-2 border rounded"
            onChange={(e) => handleFilterChange("sort", e.target.value)}
          >
            <option value="">Select</option>
            <option value="newArrivals">New Arrivals</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;
