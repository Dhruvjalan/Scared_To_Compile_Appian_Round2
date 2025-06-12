"use client";

import Image from "next/image";
import { useKart } from "@/hooks/useKart";
import { useState, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Moon,
  Sun,
  Paperclip,
  ArrowRightFromLine,
  Brain,
  ShoppingCart,
  Trash2,
  Mic,
  StopCircle,
  Repeat,
  Rows3,
  LayoutGrid
} from "lucide-react";

import Recorder from "./Recorder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SearchBar from "./searchbar";
import ImageCarousel from "./imagescroller";
import AiText from "./aiText";
import HumanText from "./humanText";
import DownvoteButton from "./downvote";

export default function ImageUploader() {
  const [isDark, setIsDark] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [openDetails, setOpenDetails] = useState<{ [key: string]: boolean }>({});
  const [selectedKeyword, setSelectedKeyword] = useState<string[]>([]);
  const [humanMessage, setHumanMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    {
      sender: string;
      text: string;
      aijson: any[] | null;
      humanimage: File | null;
      humanQuery?: string;
    }[]
  >([]);
  const [analyzeTrigger, setAnalyzeTrigger] = useState(false);
  const [openModalData, setOpenModalData] = useState<null | any>(null);
  const { kart, handleAddToKart, handleRemoveFromKart } = useKart();
  const [audio, setAudio] = useState("");
  const [transcription, setTranscription] = useState("");
  const [hasMounted, setHasMounted] = useState(false);
  const [uimodeCard, setuiModeCard] = useState(true);
  const [openImagesDropdown, setOpenImagesDropdown] = useState<{ [key: string]: boolean }>({});
  const [openDetailsDropdown, setOpenDetailsDropdown] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setHasMounted(true);
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleReload = () => {
    setChatHistory([]);
    setHumanMessage("")
    setAudio("")
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    setError(null);
    setResults(null);
    setChatHistory([]);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload JPG, PNG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5 MB.");
      return;
    }
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setResults(null);
    setChatHistory([]);
  };

  const handleAnalyzeImage = () => {
    setAnalyzeTrigger(true);
    setChatHistory((prev) => [
      ...prev,
      {
        sender: "human",
        text: humanMessage === "" ? "Analyze this image." : humanMessage,
        aijson: null,
        humanimage: image,
      },
    ]);
  };

  useEffect(() => {
    if (!analyzeTrigger || (!image && !humanMessage)) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        if (image !== null) {
          formData.append("image", image);
        }
        formData.append("text", humanMessage);
        const res = await fetch("http://127.0.0.1:5000/search", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        
        const result = await res.json();
        setChatHistory((prev) => [
          ...prev,
          { 
            sender: "ai", 
            text: result.ai_text, 
            aijson: result.results, 
            humanimage: null,
            humanQuery: humanMessage
          },
        ]);
        setResults(result.results);
      } catch (err) {
        setError("Failed to analyze image. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
        setAnalyzeTrigger(false);
      }
    };
    fetchResults();
  }, [analyzeTrigger, image, audio, transcription, humanMessage]);

  const handleToggleDetails = (id: string) =>
    setOpenDetails((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleKeywordClick = (keyword: string) => {
    setSelectedKeyword((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  };

  const handleSearchFurther = (imgsrc: string) => {
    setPreview(imgsrc);
    setChatHistory([]);
    setHumanMessage("")
    setAudio("")
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative">
      {/* UI Controls */}
      <div className="fixed top-4 right-4 flex space-x-2">
        <button 
          onClick={() => window.open('/cart','_blank')}
          aria-label="View Cart"
          className="flex items-center p-2 rounded bg-primary text-primary-foreground hover:bg-primary/80"
          title="View Cart"
        >
          <ShoppingCart className="mr-1" /> View Cart
        </button>
           
        <button 
          onClick={() => setuiModeCard(!uimodeCard)}
          aria-label="Toggle view mode"
          className="p-2 rounded bg-primary text-primary-foreground hover:bg-primary/80"
          title="Toggle view mode"
        >
          {!uimodeCard? <LayoutGrid />:<Rows3 />}
        </button>

        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="p-2 rounded bg-primary text-primary-foreground hover:bg-primary/80"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {/* Upload Area */}
        {!image && !audio ? (
          <div
            className={`border-2 rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-ring bg-muted" : "border-border hover:border-ring"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
            aria-label="Drag and drop an image, or click to browse files"
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-lg font-medium mb-1">Drag & drop an image</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
            />
          </div>
        ) : (
          <div className="relative mb-4 space-y-4">
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
              {image && (
                <div className="relative w-full md:w-1/2">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt="Uploaded preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-muted-foreground text-background p-1 rounded-full hover:bg-foreground hover:text-background"
                    aria-label="Remove uploaded image"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {audio && (
                <div className="w-full md:w-1/2 flex flex-col justify-center items-start space-y-2">
                  <audio src={audio} controls className="w-full" />
                  <Button onClick={() => setAudio('')}>
                    <Repeat /> Record Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive text-destructive-foreground rounded-lg text-center mb-4">
            {error}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="">
            <h3 className="text-xl font-semibold mb-3">AI Analysis Results</h3>

            {selectedKeyword.length > 0 && (
              <div className="flex flex-wrap mb-3 text-xs text-muted-foreground">
                <span className="mr-2">Selected:</span>
                {selectedKeyword.map((kw) => (
                  <span
                    key={kw}
                    className="flex justify-evenly items-center bg-accent text-accent-foreground px-2 py-1 rounded-full mr-1"
                  >
                    {kw}
                    <X
                      onClick={() => setSelectedKeyword((prev) => prev.filter((k) => k !== kw))}
                      className="h-4 w-4 ml-1 cursor-pointer"
                      aria-label={`Remove keyword ${kw}`}
                    />
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex flex-row flex-wrap justify-evenly max-w-3xl">
  {chatHistory.map((msg, idx) => {
    if (msg.sender === "ai") {
      return msg.aijson
        ? msg.aijson
            .filter((res) =>
              selectedKeyword.length === 0
                ? true
                : res.keywords.some((kw: string) => selectedKeyword.includes(kw))
            )
            .map((result: any, jsonIdx: number) =>
              uimodeCard ? (
                <Card
                          key={`${result.id}-${jsonIdx}`}
                          className="relative rounded-xl border border-border bg-card text-card-foreground shadow-md transition-all flex flex-col m-3"
                        >
                          {/* Downvote Button */}
                          <DownvoteButton

                            productId={idx}
                            userQuery={humanMessage}
                          />

                          {/* Product Info */}
                          <div className=" flex flex-col items-center">
                            <div className=" h-[15rem] mb-4">
                              <ImageCarousel images={result.images_Urls} />
                            </div>

                            <div className="text-center mb-2">
                              <p className="text-base font-bold">
                                {result.productDisplayName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {result.brand} • {result.gender}
                              </p>
                            </div>

                            <div className="text-center text-sm mb-3">
                              ₹
                              <span className="text-lg font-bold mx-1">
                                {result.discountedPrice}
                              </span>
                              {result.discountedPrice < result.price && (
                                <span className="text-xs line-through text-muted-foreground ml-2">
                                  ₹{result.price}
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-center gap-2 mb-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(result.landingPageUrl, "_blank")
                                }
                                aria-label="Buy now"
                                title="Buy now on Myntra.com"
                                className="px-3 py-1"
                              >
                                Buy <ExternalLink className="w-4 h-4 ml-1" />
                              </Button>

                              {!kart.includes(result.id) ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddToKart(result)}
                                  aria-label="Add to cart"
                                  title="Add to cart"
                                  className="px-3 py-1"
                                >
                                  <ShoppingCart />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveFromKart(result)}
                                  aria-label="Remove from cart"
                                  title="Remove from cart"
                                  className="px-3 py-1"
                                >
                                  <Trash2 />
                                </Button>
                              )}

                              <button
                                onClick={() =>
                                  handleSearchFurther(result.images_Urls[0])
                                }
                                aria-label="Search further"
                                title="More about this product"
                                className="p-2 hover:bg-muted rounded"
                              >
                                <ArrowRightFromLine className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Show/Hide Details Toggle */}
                            <button
                              onClick={() => setOpenModalData(result)}
                              className="text-sm text-primary hover:underline"
                              aria-expanded={!!openDetails[result.id]}
                              aria-controls={`details-${result.id}`}
                            >
                              {openDetails[result.id]
                                ? "Hide details"
                                : "Show details"}
                            </button>
                          </div>

                          {openDetails[result.id] && (
                            <div
                              id={`details-${result.id}`}
                              className="absolute inset-0 z-20 bg-background p-4 rounded-xl overflow-y-auto shadow-lg"
                            >
                              <button
                                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                onClick={() => handleToggleDetails(result.id)}
                                aria-label="Close details"
                              >
                                <X className="w-5 h-5" />
                              </button>

                              <div className="w-[96px] h-[96px] mx-auto mb-4">
                                <ImageCarousel images={result.images_Urls} />
                              </div>

                              <div className="text-sm space-y-4">
                                <section>
                                  <h4 className="font-medium mb-1">
                                    Description
                                  </h4>
                                  <p
                                    dangerouslySetInnerHTML={{
                                      __html: result.description,
                                    }}
                                  />
                                </section>

                                <section>
                                  <h4 className="font-medium mb-1">Colors</h4>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {Array.isArray(result.colors) &&
                                    typeof result.colors[0] === "string"
                                      ? result.colors.map((c, i) => (
                                          <span
                                            key={i}
                                            className="px-2 py-1 bg-muted text-foreground rounded-full text-xs"
                                          >
                                            {c}
                                          </span>
                                        ))
                                      : result.colors.map((c, i) => (
                                          <Button
                                            key={i}
                                            size="xs"
                                            variant="outline"
                                            onClick={() =>
                                              window.open(c.BuyLink, "_blank")
                                            }
                                          >
                                            {c.Color}
                                          </Button>
                                        ))}
                                  </div>
                                </section>

                                <section>
                                  <h4 className="font-medium mb-1">Keywords</h4>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {result.keywords.map((keyword, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleKeywordClick(keyword)
                                        }
                                        className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                                          selectedKeyword.includes(keyword)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground"
                                        }`}
                                        aria-pressed={selectedKeyword.includes(
                                          keyword
                                        )}
                                      >
                                        {keyword}
                                      </button>
                                    ))}
                                  </div>
                                </section>
                              </div>
                            </div>
                          )}
                        </Card>
              )
              

          : (<Card
  key={`${result.id}-${jsonIdx}`}
  className="relative max-w-3xl w-full rounded-xl border border-border bg-card text-card-foreground shadow-md transition-all flex flex-row m-3"
>
  <div className="w-1/3 min-w-[200px] relative">
    <ImageCarousel images={result.images_Urls} className="h-full" />
    
    <div className="absolute top-2 left-2 z-10">
      <DownvoteButton
        productId={idx}
        userQuery={humanMessage}
      />
    </div>
  </div>

  <div className="w-2/3 p-4 flex flex-col">
    <div className="flex-grow">
      <div className="mb-2">
        <p className="text-lg font-bold line-clamp-1">
          {result.productDisplayName}
        </p>
        <p className="text-sm text-muted-foreground">
          {result.brand} • {result.gender}
        </p>
      </div>

      <div className="text-sm mb-3">
        ₹
        <span className="text-lg font-bold mx-1">
          {result.discountedPrice}
        </span>
        {result.discountedPrice < result.price && (
          <span className="text-xs line-through text-muted-foreground ml-2">
            ₹{result.price}
          </span>
        )}
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(result.landingPageUrl, "_blank")}
          aria-label="Buy now"
          title="Buy now on Myntra.com"
          className="px-3 py-1"
        >
          Buy <ExternalLink className="w-4 h-4 ml-1" />
        </Button>

        {!kart.includes(result.id) ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAddToKart(result)}
            aria-label="Add to cart"
            title="Add to cart"
            className="px-3 py-1"
          >
            <ShoppingCart />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRemoveFromKart(result)}
            aria-label="Remove from cart"
            title="Remove from cart"
            className="px-3 py-1"
          >
            <Trash2 />
          </Button>
        )}

        <button
          onClick={() => handleSearchFurther(result.images_Urls[0])}
          aria-label="Search further"
          title="More about this product"
          className="p-2 hover:bg-muted rounded"
        >
          <ArrowRightFromLine className="w-5 h-5" />
        </button>
      </div>

      {/* Show/Hide Details Toggle */}
      <button
        onClick={() => setOpenModalData(result)}
        className="text-sm text-primary hover:underline"
        aria-expanded={!!openDetails[result.id]}
        aria-controls={`details-${result.id}`}
      >
        {openDetails[result.id] ? "Hide details" : "Show details"}
      </button>
    </div>

    {/* Keywords (always visible in this layout) */}
    <div className="mt-auto pt-2">
      <div className="flex flex-wrap gap-1">
        {result.keywords.slice(0, 4).map((keyword, index) => (
          <button
            key={index}
            onClick={() => handleKeywordClick(keyword)}
            className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
              selectedKeyword.includes(keyword)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            }`}
            aria-pressed={selectedKeyword.includes(keyword)}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Details Overlay */}
  {openDetails[result.id] && (
    <div
      id={`details-${result.id}`}
      className="absolute inset-0 z-20 bg-background p-4 rounded-xl overflow-y-auto shadow-lg flex"
    >
      <div className="w-1/3 min-w-[200px]">
        <ImageCarousel images={result.images_Urls} className="h-full" />
      </div>
      <div className="w-2/3 p-4 relative">
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={() => handleToggleDetails(result.id)}
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-sm space-y-4">
          <section>
            <h4 className="font-medium mb-1">Description</h4>
            <p dangerouslySetInnerHTML={{ __html: result.description }} />
          </section>

          <section>
            <h4 className="font-medium mb-1">Colors</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(result.colors) && typeof result.colors[0] === "string"
                ? result.colors.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-muted text-foreground rounded-full text-xs"
                    >
                      {c}
                    </span>
                  ))
                : result.colors.map((c, i) => (
                    <Button
                      key={i}
                      size="xs"
                      variant="outline"
                      onClick={() => window.open(c.BuyLink, "_blank")}
                    >
                      {c.Color}
                    </Button>
                  ))}
            </div>
          </section>

          <section>
            <h4 className="font-medium mb-1">All Keywords</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.keywords.map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => handleKeywordClick(keyword)}
                  className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                    selectedKeyword.includes(keyword)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                  aria-pressed={selectedKeyword.includes(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )}
</Card>)
            )
        : (
          <div className="w-full flex justify-center mb-3">
            <AiText key={`ai-text-${idx}`} message={msg.text} />
          </div>
        );
    } else {
      return (
        <div className="w-full flex justify-center mb-3">
          <HumanText key={`human-${idx}`} message={msg.text} />
        </div>
      );
    }
  })}
</div>

          </div>
        )}

        {openModalData && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl relative p-4">
              <div className="sticky top-0 z-10 flex justify-end p-2">
                <button
                  onClick={() => setOpenModalData(null)}
                  aria-label="Close details"
                  className="text-gray-500 hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
  <div className="w-[15rem] h-[15rem]">
    <ImageCarousel images={openModalData.images_Urls} />
  </div>

  <div className="text-center">
    <p className="text-base font-bold">{openModalData.productDisplayName}</p>
    <p className="text-xs text-muted-foreground">{openModalData.brand} • {openModalData.gender}</p>
    <div className="mt-2 text-sm">
      ₹<span className="text-xl font-bold mx-1">{openModalData.discountedPrice}</span>
      {openModalData.discountedPrice < openModalData.price && (
        <span className="text-xs line-through text-muted-foreground ml-2">
          ₹{openModalData.price}
        </span>
      )}
    </div>
  </div>
</div>





              <div className="text-sm space-y-3">
                <div>
                  <h4 className="font-medium">Description</h4>
                  <p dangerouslySetInnerHTML={{ __html: openModalData.description }} />
                </div>

                <div>
                  <h4 className="font-medium">Colors</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Array.isArray(openModalData.colors) && typeof openModalData.colors[0] === "string"
                      ? openModalData.colors.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-muted text-foreground rounded-full text-xs"
                          >
                            {c}
                          </span>
                        ))
                      : openModalData.colors.map((c, i) => (
                          <Button
                            key={i}
                            size="xs"
                            variant="outline"
                            onClick={() => window.open(c.BuyLink, "_blank")}
                          >
                            {c.Color}
                          </Button>
                        ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">Keywords</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {openModalData.keywords.map((keyword: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleKeywordClick(keyword)}
                        className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                          selectedKeyword.includes(keyword)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button onClick={handleAnalyzeImage} disabled={loading} className="py-2 px-6">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Find Product
              </>
            )}
          </Button>
        </div>

        <div className="sticky bottom-0 w-full grid grid-cols-11 items-center mt-4 rounded-lg overflow-hidden shadow-sm bg-muted hover:ring-2 hover:ring-ring hover:border-ring">
          <div className="col-span-8 flex items-start">
            <SearchBar
              setSearchQuery={setHumanMessage}
              searchQuery={humanMessage}
              uploadImage={image}
              transcripted_text={transcription}
              className="w-full flex align-start bg-muted text-foreground placeholder-muted-foreground focus:outline-none rounded-lg px-4 py-3 transition duration-200"
            />
          </div>
          
          <button
            onClick={() => document.getElementById("file-upload")?.click()}
            aria-label="Attach image"
            className="col-span-1 p-2 hover:bg-gray-200 rounded flex justify-center"
            title="Attatch images"
          >
            <Paperclip className="w-5 h-5" />
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
            />
          </button>
          
          <Recorder
            onTranscription={(transcripted_text: string) => setTranscription(transcripted_text)}
            onAudioReady={(url: string) => setAudio(url)}
            customButton={({ recording, startRecording, stopRecording }) => (
              <button 
                onClick={recording ? stopRecording : startRecording} 
                className="col-span-1 p-2 hover:bg-gray-200 rounded flex justify-center"
              >
                {recording ? <StopCircle /> : <Mic />}
              </button>
            )}
            displayrecording={null}
          />
          
          <button
            onClick={handleReload}
            aria-label="Clear chat"
            className="col-span-1 p-2 hover:bg-gray-200 rounded flex justify-center"
            title="Reload Conversation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
