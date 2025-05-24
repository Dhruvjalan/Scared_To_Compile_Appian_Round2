"use client"
import Image from "next/image"
import { useState,useEffect } from "react"
import { Upload, X ,Loader2 ,ExternalLink, ImageDown, ImageMinus, ChevronUp , ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeImage } from "@/app/actions/analyze-image"
import SearchBar from "./searchbar"
import ImageCarousel from './imagescroller'
import AiText from './aiText'
import HumanText from './humanText'

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any[] | null>(null)
  const [openImagesDropdown, setOpenImagesDropdown] = useState<{ [key: string]: boolean }>({})
  const [openDetailsDropdown, setOpenDetailsDropdown] = useState<{ [key: string]: boolean }>({})
  const [selectedKeyword, setSelectedKeyword] = useState<string[]>([])
  const [aiMessage, setAiMessage] = useState<string>("")
  const [humanMessage, setHumanMessage] = useState<string>("")

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(true)
    }
  
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
    }
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
  
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileChange(e.dataTransfer.files[0])
      }
    }
  
    const handleFileChange = (file: File) => {
      setError(null)
      setResults(null)
      setHumanMessage("Analyse this image and give similar results.")
  
      const validTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPG, PNG, or WEBP)")
        return
      }
  
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit")
        return
      }
  
      if (file) {
        setImage(file)
        setAiMessage("Got it. Let me look for similar styles for you.")
      }  

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0])
    }
  }

  const handleRemoveImage = () => {
    setImage(null)
    setPreview(null)
    setResults(null)
  }

  const handleAnalyzeImage = async () => {
    if (!image) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", image)

      const res = await fetch('http://127.0.0.1:5000/search',{
        method:'POST',
        body: formData
      })

      const result = res.json();
      console.log("Response", result);
      setResults(result)
      
    } catch (err) {
      setError("Failed to analyze image. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${dragging ? "border-gray-800 bg-gray-50" : "border-gray-300 hover:border-gray-400"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">Drag and drop your image here</p>
          <p className="text-sm text-gray-500">or click to browse files</p>
          <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange}/>
        </div>
      ) : (
        <div className="space-y-6">
          {humanMessage && (
            <HumanText message={humanMessage}/>
          )}
          
          <div className="relative">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-contain"/>
            </div>
            <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100 transition-opacity">
              <X className="h-5 w-5"/>
            </button>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleAnalyzeImage} disabled={loading} className="px-6">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Analyzing...
                </>
              ) : (
                "Analyze Image"
              )}
            </Button>
          </div>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-center">{error}</div>}

      {results && (
        <div>
          <AiText message={aiMessage} />
          <div className="relative">
          <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>
          {selectedKeyword.length > 0 && (
            <div className="w-full mt-2">
              <span className="text-xs text-gray-500 mr-2">Selected:</span>
              {selectedKeyword.map(kw => (
                <span key={kw} className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1">
                  {kw}
                  <X onClick={() => setSelectedKeyword(prev => prev.filter(k => k !== kw))} className="h-4 w-4 ml-1"/>
                </span>
              ))}
              </div>
          )}</div>
          

          {results.map(result => (selectedKeyword.length === 0 || result.keywords.some((item:string) => selectedKeyword.includes(item))) && (
            <Card key={result.id} className="relative p-6 mt-8">
              <X
                onClick={() => {
                  setError("Feedback recorded")
                  setTimeout(() => setError(null),5000)
                }}
                className="absolute top-4 right-4 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="flex flex-row items-start">
                  <div className="flex-1">
                    <p className="text-gray-900 text-2xl font-bold mb-2">{result.productDisplayName}</p>
                    <p className="text-sm text-gray-500 mb-4">{result.brand} • {result.gender}</p>
                  </div>
                  <div className="flex items-start space-x-2 mt-5 ">
                    {openImagesDropdown[result.id] ? (
                      <ImageMinus  onClick={() => setOpenImagesDropdown((prev) => ({...prev,[result.id]: !prev[result.id]}))}/>
                    ) : (
                      <ImageDown onClick={() => setOpenImagesDropdown((prev) => ({...prev,[result.id]: !prev[result.id]}))}/>
                    )}
                    <Button onClick={() => window.open(result.landingPageUrl, "_blank")} className="px-4 ">
                      Buy Now
                      <ExternalLink className="ml-2 h-4 w-4"/>
                    </Button>
                  </div>
                </div>

                {openImagesDropdown[result.id] && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.images_Urls.length ? <ImageCarousel images={result.images_Urls} />: <p className="p-4 text-gray-500 text-sm">No images available</p>}
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-700">Price</h4>
                  <p className="text-gray-900 flex items-baseline">
                    ₹<span className="text-3xl font-bold mx-1">{result.discountedPrice}</span>
                    {result.discountedPrice < result.price && (
                      <span className="text-sm line-through text-gray-500 ml-2">₹{result.price}</span>
                    )}
                  </p>
                </div>
            
                
                {openDetailsDropdown[result.id] ? (
                  <div>
                    <ChevronUp onClick={() => setOpenDetailsDropdown((prev) => ({ ...prev, [result.id]: !prev[result.id] }))} />
                    <>
                      <h4 className="font-medium text-gray-700">Description</h4>
                      <div className="text-gray-900 text-sm" dangerouslySetInnerHTML={{__html: result.description}}/>
                      <h4 className="font-medium text-gray-700">Colors</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(result.colors) && typeof result.colors[0] === "string" && result.colors.map((c: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{c}</span>
                        ))}
                        {Array.isArray(result.colors) && typeof result.colors[0] === "object" && result.colors.map((c: any, i: number) => (
                          <Button key={i} variant="outline" onClick={() => window.open(c.BuyLink, "_blank")} className="px-2 py-1 text-sm">
                            {c.Color}
                          </Button>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">More like this</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.Morelikethis.map((link: string, i: number) => (
                            <Button key={i} onClick={() => window.open(link, "_blank")} variant="secondary" className="px-3 py-1 text-xs">
                              Option {i + 1}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">Keywords</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.keywords.map((keyword: string, index: number) => (
                            <span
                              key={index}
                              onClick={() => setSelectedKeyword(prev => prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword])}
                              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedKeyword.includes(keyword) ? "text-gray-100 bg-gray-800" : "bg-gray-100 text-gray-800"}`}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  </div>
                ) : (
                  <ChevronDown onClick={() => setOpenDetailsDropdown((prev) => ({ ...prev, [result.id]: !prev[result.id] }))} />
                )}
              </div>
            
            </Card>
          ))}
          <AiText message={"Hope you liked those picks! Let me know if you'd like me to narrow it down by color, brand, or find another look, I'm happy to help!"}/>

        </div>
      )}
      <SearchBar  searchQuery={humanMessage} setSearchQuery={setHumanMessage}/>

    </div>
  )
}
