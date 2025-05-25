import { Suspense } from "react"
import ImageUploader from "@/app/components/image-uploader"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
  <main className="min-h-screen bg-background text-foreground transition-colors">
    <div className="w-full px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">SmartShopper</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your product image and our AI will analyze it to provide detailed information and recommendations.
        </p>
      </div>

      <div className="w-full max-w-3xl mx-auto bg-card rounded-xl shadow-lg border border-border">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-2xl font-semibold">AI Product Analyser</h2>
          </div>

          <Suspense fallback={<div className="text-center p-12">Loading uploader...</div>}>
            <ImageUploader />
          </Suspense>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Supported formats: JPG, PNG, WEBP (Max size: 5MB)</p>
          </div>
        </div>
      </div>
    </div>
  </main>
)

}
