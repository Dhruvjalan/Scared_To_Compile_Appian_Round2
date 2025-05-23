"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeImage } from "@/app/actions/analyze-image"
import { Image as Imageicon, ImageDown , ImageMinus, ExternalLink, Upload, X, Loader2 } from "lucide-react"
import SearchBar from "./searchbar"


export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openImagesDropdown, setOpenImagesDropdown] = useState<{ [key: string]: boolean }>({})
  const [SelectKeyword, SetSelectKeyword] = useState<string[]>([])

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

    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WEBP)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit")
      return
    }

    setImage(file)

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

  const handleNegFeedback = ()=>{
    console.log('neg');
    setError("Feedback taken.")
  }
  const handleAnalyzeImage = async () => {
    if (!image) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("image", image)


      // const res = await fetch('http://127.0.0.1:5000/search',{
      //   method:'POST',
      //   body: formData
      // })

      // const result = res.json();
      // console.log("Response", result);

      const result = await analyzeImage(formData)
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
      <SearchBar />
      {!image ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            dragging ? "border-gray-800 bg-gray-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">Drag and drop your image here</p>
          <p className="text-sm text-gray-500">or click to browse files</p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-100">
              <Image src={preview! || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
            </div>
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white p-1 rounded-full hover:bg-opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleAnalyzeImage} disabled={loading} className="px-6">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>
        {/* To show selected keywords (optional): */}
                {SelectKeyword.length > 0 && (
                  <div className="w-full mt-2">
                   <span className="text-xs text-gray-500 mr-2">Selected:</span>
                   {SelectKeyword.map((kw) => (
                    <span
                      key={kw}
                      className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-1"
                    > <div className="flex flex-row">
                      {kw} <X onClick={() =>
                      SetSelectKeyword(prev => prev.filter(k => k !== kw) // Remove if exists
                        
                      )
                    } className="h-4 w-4" />
                      </div>
                    </span>
                   ))}
                  </div>
                )}
            {results.map((result)=>(
              (Boolean(!SelectKeyword.length)||result.keywords.some(item => SelectKeyword.includes(item))) && (
            <Card key={results.indexOf(result)} className="relative p-6 mt-8">
              <X
  onClick={() => {
    setError("Feedback recorded")
    setTimeout(() => setError(null), 5000)
  }}
  
  className="absolute top-4 right-4 cursor-pointer"
/>             
  <div className="space-y-4">
                <div className="flex flex-row items-center relative">
                  <p className="text-gray-900 text-2xl font-bold mr-4 mb-10"><strong>{result.title}</strong></p>
                  
              <div
              className="relative mx-2">
                { openImagesDropdown[result.id]?

              (<ImageMinus onClick={() =>
                  setOpenImagesDropdown((prev) => ({ ...prev, [result.id]: !prev[result.id] }))
              }/>) : (<ImageDown onClick={() =>
                  setOpenImagesDropdown((prev) => ({ ...prev, [result.id]: !prev[result.id] }))
              }/>)
        }

  </div>
                <Button
        onClick={() => window.open(result.amazonSource, '_blank')}
        className="px-6 mx-2"
      >
        Buy Now
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>

        </div>

        {openImagesDropdown[result.id] && (
                  <div>
                    { Boolean(result.imageSource) ? (
                        <img
                          key={result.id}
                          src={result.imageSource}
                          alt={`Image ${result.id}`}
                          className="w-auto h-auto object-cover border-b last:border-b-0"
                        />
                    ) : (
                      <p className="p-4 text-gray-500 text-sm">No images available</p>
                    )}
                  </div>
                )}

            <div>
              <h4 className="font-medium text-gray-700">Product Category</h4>
              <p className="text-gray-900">{result.category}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Description</h4>
              <p className="text-gray-900">{result.description}</p>
            </div>

            <div>
              <p className="text-gray-900 flex flex-row mt-10">
                $<p className="text-gray-900 text-3xl font-bold mr-4 mb-3"><strong>{result.priceRange.max}</strong></p>
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Keywords</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.keywords.map((keyword: string, index: number) => (
                    <span className={`px-3 py-1 ${SelectKeyword.includes(keyword)?"text-gray-100 bg-gray-800":"bg-gray-100 text-gray-800"} rounded-full text-sm`} key={keyword}
                    onClick={() =>
                      SetSelectKeyword(prev =>
                      prev.includes(keyword)
                        ? prev.filter(k => k !== keyword) 
                        : [...prev, keyword] 
                      )
                    }>
                      {keyword}
                    </span>
                ))}
              </div>
            </div>
          </div>
        </Card>)
        ))}
        </div>
        
      )}
    </div>
  )
}
