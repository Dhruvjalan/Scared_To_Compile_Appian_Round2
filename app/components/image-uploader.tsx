"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { analyzeImage } from "@/app/actions/analyze-image"

export default function ImageUploader() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    // Reset states
    setError(null)
    setResults(null)

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WEBP)")
      return
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit")
      return
    }

    setImage(file)

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
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Product Category</h4>
              <p className="text-gray-900">{results.category}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Suggested Title</h4>
              <p className="text-gray-900">{results.title}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Description</h4>
              <p className="text-gray-900">{results.description}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Suggested Price Range</h4>
              <p className="text-gray-900">
                ${results.priceRange.min} - ${results.priceRange.max}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700">Keywords</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {results.keywords.map((keyword: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
