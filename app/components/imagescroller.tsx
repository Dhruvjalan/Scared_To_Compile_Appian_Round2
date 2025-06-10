"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);

  const handleDotClick = (index: number) => {
    setCurrent(index);
  };

  return (
  <div className="w-[15rem] h-[15rem] relative overflow-hidden rounded-lg">
    <div
      className="flex transition-transform duration-500 ease-in-out"
      style={{ transform: `translateX(-${current * 100}%)` }}
    >
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`carousel-image-${index}`}
          className="w-full h-[15rem] object-cover flex-shrink-0"
        />
      ))}
    </div>

    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
      {images.map((_, index) => (
        <button
          key={index}
          onClick={() => handleDotClick(index)}
          className={`w-2 h-2 rounded-full ${
            current === index ? "bg-black" : "bg-gray-400"
          }`}
        />
      ))}
    </div>
  </div>
);

}
