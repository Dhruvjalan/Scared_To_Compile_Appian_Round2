export default function SearchBar({ setSearchQuery, searchQuery, uploadImage }) {
  return (
    <div className="flex items-center space-x-4">
      <input
        type="text"
        placeholder="Eg. Analyse this image and give similar results. or something specific"
        value={searchQuery}
        defaultValue={"Analyse this image and give similar results."}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 border w-[30vw] border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        required
      />
    </div>
  )
}
