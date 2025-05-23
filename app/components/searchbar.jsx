
export default function SearchBar({ searchQuery, setSearchQuery}) {
  return (
    <div className="flex items-center space-x-4">
      <input
        type="text"
        placeholder="Search products or keywords"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        required
      />  
    </div>
  )
}
