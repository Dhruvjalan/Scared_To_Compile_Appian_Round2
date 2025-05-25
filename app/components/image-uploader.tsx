  "use client"
  import Image from "next/image"
  import { useState, useEffect } from "react"
  import {
    Upload, X, Loader2, ExternalLink, ImageDown, ImageMinus, ChevronUp, ChevronDown, Moon, Sun, Paperclip, Brain, RotateCcw  
  } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import { Card } from "@/components/ui/card"
  import SearchBar from "./searchbar"
  import ImageCarousel from './imagescroller'
  import AiText from './aiText'
  import HumanText from './humanText'

  export default function ImageUploader() {
    const [isDark, setIsDark] = useState(false)
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
    const [chatHistory, setChatHistory] = useState<{ sender: string, text: string, aijson:any[] | null, humanimage:File | null}[]>([])
    const [analyzeTrigger, setAnalyzeTrigger] = useState(false)

    // Dark mode effect
    useEffect(() => {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }, [isDark])


    const handleReload = ()=>{
      setChatHistory([])
    }
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
      setChatHistory([])
      // setHumanMessage("Analyse this image and give similar results.")

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
      // setAiMessage("Got it. Let me look for similar styles for you.")

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
      setChatHistory([])

    }

    const handleAnalyzeImage = () => {
      if (!image) return
      setAnalyzeTrigger(true)
      setChatHistory(prev => [...prev, { sender: "human", text: humanMessage==""?"Analyse this image and give similar results.":humanMessage, aijson:null,humanimage:image}])

    }

    useEffect(() => {
      if (!analyzeTrigger || !image) return

      const fetchResults = async () => {
        setLoading(true)
        setError(null)
        try {
          const formData = new FormData()
          formData.append("image", image)
          formData.append("text",humanMessage)
          const res = await fetch('http://127.0.0.1:5000/search', {
            method: 'POST',
            body: formData
          })
          const result = await res.json()
          setChatHistory(prev => [...prev, { sender: "ai", text: result['ai_text'], aijson: result['results'], humanimage:null}])

          setResults(result['results'])

          setAiMessage(result['ai_text'])
          console.log("chathistory = ",chatHistory)
        } catch (err) {
          setError("Failed to analyze image. Please try again.")
          console.error(err)
        } finally {
          setLoading(false)
          setAnalyzeTrigger(false)
        }
      }
      fetchResults()
    }, [analyzeTrigger, image,results])

    return (
      <div className="min-h-screen w-full bg-background text-foreground transition-colors relative">
        <button
          onClick={() => setIsDark(prev => !prev)}
          className="fixed  top-4 right-4 px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="space-y-6 p-4 w-full">
          {!image ? (
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${dragging ? "border-ring bg-muted" : "border-border hover:border-ring"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">Drag and drop your image here</p>
              <p className="text-sm text-muted-foreground">or click to browse files</p>
              <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* {chatHistory.map((msg, idx) =>
              msg.sender === "human" ? (
                <HumanText key={idx} message={msg.text} />
              ) : (
                <AiText key={idx} message={msg.text} />
              )
            )} */}

              <div className="relative">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                  <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
                </div>
                <button onClick={handleRemoveImage} className="absolute top-2 right-2 bg-muted-foreground text-background p-1 rounded-full hover:bg-foreground hover:text-background transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
            </div>
          )}

          {error && <div className="p-4 bg-destructive text-destructive-foreground rounded-lg text-center">{error}</div>}

          {results && (
            <div>
              {/* <AiText message={aiMessage} /> */}
              <h3 className="text-xl font-semibold mb-4">AI Analysis Results</h3>
              {selectedKeyword.length > 0 && (
                <div className="w-full mt-2">
                  <span className="text-xs text-muted-foreground mr-2">Selected:</span>
                  {selectedKeyword.map(kw => (
                    <span key={kw} className="inline-flex items-center bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs mr-1">
                      {kw}
                      <X onClick={() => setSelectedKeyword(prev => prev.filter(k => k !== kw))} className="h-4 w-4 ml-1 cursor-pointer" />
                    </span>
                  ))}
                </div>
              )}
  {/*  */}
              {chatHistory.map((msg:any,idx)=>{
                  return msg.sender=='ai' ? (
                (msg.aijson ? msg.aijson.map((result: any,jsonidx:number) => (selectedKeyword.length === 0 || result.keywords.some((item: string) => selectedKeyword.includes(item))) && (
                <div className="json+aitext">
                {jsonidx==0&&(<AiText key={idx} message={msg.text} />)}
                <Card key={result.id} className="relative p-6 mt-8 bg-card text-card-foreground border border-border">
                  <X
                    onClick={() => {
                      setError("Feedback recorded")
                      setTimeout(() => setError(null), 5000)
                    }}
                    className="absolute top-4 right-4 cursor-pointer"
                  />
                  <div className="space-y-4">
                    <div className="flex flex-row items-start">
                      <div className="flex-1">
                        <p className="text-2xl font-bold mb-2">{result.productDisplayName}</p>
                        <p className="text-sm text-muted-foreground mb-4">{result.brand} • {result.gender}</p>
                      </div>
                      <div className="flex items-start space-x-2 mt-5">
                        {openImagesDropdown[result.id] ? (
                          <ImageMinus onClick={() => setOpenImagesDropdown(prev => ({ ...prev, [result.id]: !prev[result.id] }))} />
                        ) : (
                          <ImageDown onClick={() => setOpenImagesDropdown(prev => ({ ...prev, [result.id]: !prev[result.id] }))} />
                        )}
                        <Button onClick={() => window.open(result.landingPageUrl, "_blank")} className="px-4">
                          Buy Now <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {openImagesDropdown[result.id] && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {result.images_Urls.length ? <ImageCarousel images={result.images_Urls} /> : <p className="p-4 text-muted-foreground text-sm">No images available</p>}
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium">Price</h4>
                      <p className="flex items-baseline">
                        ₹<span className="text-3xl font-bold mx-1">{result.discountedPrice}</span>
                        {result.discountedPrice < result.price && (
                          <span className="text-sm line-through text-muted-foreground ml-2">₹{result.price}</span>
                        )}
                      </p>
                    </div>

                    {openDetailsDropdown[result.id] ? (
                      <div>
                        <ChevronUp onClick={() => setOpenDetailsDropdown(prev => ({ ...prev, [result.id]: !prev[result.id] }))} />
                        <div>
                          <h4 className="font-medium">Description</h4>
                          <div className="text-sm" dangerouslySetInnerHTML={{ __html: result.description }} />
                          <h4 className="font-medium">Colors</h4>
                          <div className="flex flex-wrap gap-2">
                            {Array.isArray(result.colors) && typeof result.colors[0] === "string" && result.colors.map((c: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-muted text-foreground rounded-full text-sm">{c}</span>
                            ))}
                            {Array.isArray(result.colors) && typeof result.colors[0] === "object" && result.colors.map((c: any, i: number) => (
                              <Button key={i} variant="outline" onClick={() => window.open(c.BuyLink, "_blank")} className="px-2 py-1 text-sm">
                                {c.Color}
                              </Button>
                            ))}
                          </div>
                          <h4 className="font-medium">More like this</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.Morelikethis.length>0 ? result.Morelikethis.map((link: string, i: number) => (
                              <Button key={i} onClick={() => window.open(link, "_blank")} variant="secondary" className="px-3 py-1 text-xs">
                                Option {i + 1}
                              </Button>
                            )) : <p>Not Found..</p>}
                          </div>
                          <h4 className="font-medium">Keywords</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {result.keywords.map((keyword: string, index: number) => (
                              <span
                                key={index}
                                onClick={() => setSelectedKeyword(prev => prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword])}
                                className={`px-3 py-1 rounded-full text-sm cursor-pointer ${selectedKeyword.includes(keyword) ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ChevronDown onClick={() => setOpenDetailsDropdown(prev => ({ ...prev, [result.id]: !prev[result.id] }))} />
                    )}
                  </div>
                </Card> 
                </div>            
              )):<AiText key={idx} message={msg.text} />)


                  ): (<HumanText key={idx} message={msg.text} />)


              })}
              
            </div>
          )}
          <div className="flex justify-center">
                <Button onClick={handleAnalyzeImage} disabled={loading} className="px-6">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Find Product
                    </>
                  )}
                </Button> 
              </div>
          <div className="flex flex-row">
            <SearchBar setSearchQuery={setHumanMessage} searchQuery={humanMessage} uploadImage={image} />
            <Button className="mx-1" onClick={() => document.getElementById("file-upload")?.click()}>
              <input id="file-upload" type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} />
                <Paperclip />
            </Button>
            <Button onClick={handleReload}><RotateCcw /></Button>
          </div>
        </div>
      </div>
    )
  }
