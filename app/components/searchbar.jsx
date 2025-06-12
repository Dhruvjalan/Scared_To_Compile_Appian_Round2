import { useEffect } from "react"

export default function SearchBar({ setSearchQuery, searchQuery, uploadImage, className, transcripted_text }) {
  useEffect(() => {
    if (transcripted_text) {
      setSearchQuery(searchQuery+transcripted_text)
    }
  }, [transcripted_text])

  return (
    <div className="flex items-center space-x-4 w-full">
      <input
        type="text"
        placeholder="Type or use voice..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={className}
        required
      />
    </div>
  )
}

