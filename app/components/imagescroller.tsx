"use client"

import { useState } from "react"

export default function ImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)

  const handleDotClick = (index: number) => {
    setCurrent(index)
  }

  return (
    <div className="w-full relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`carousel-image-${index}`}
            className="w-full shrink-0 object-cover"
          />
        ))}
      </div>

      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-black" : "bg-gray-400"
            }`}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </div>
    </div>
  )
}
