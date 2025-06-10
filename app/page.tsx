import { Suspense } from "react"
import ImageUploader from "@/app/components/image-uploader"
import { Sparkles } from "lucide-react"


export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors">
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">SmartShopper</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Upload your product image and our AI will analyze it to provide detailed information and recommendations.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-card rounded-lg shadow-md border border-border">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-semibold">AI Product Analyser</h2>
            </div>

            <Suspense fallback={<div className="text-center p-8">Loading uploader...</div>}>
              <ImageUploader />
            </Suspense>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>Supported formats: JPG, PNG, WEBP (Max size: 5 MB)</p>
              <p>AI-generated results may vary; please verify product details before purchase</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
