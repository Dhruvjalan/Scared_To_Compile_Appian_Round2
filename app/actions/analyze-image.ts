"use server"

export async function analyzeImage(formData: FormData) {
  // In a real application, you would:
  // 1. Upload the image to a storage service
  // 2. Call an AI service API to analyze the image
  // 3. Process and return the results

  // For this demo, we'll simulate a delay and return mock data
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock response data
  return [
  {
    id:0,
    category: "Footwear - Training Shoes",
    title: "ProFlex Training Shoes with Adaptive Sole",
    description:
      "Versatile training shoes featuring adaptive cushioning, lightweight mesh upper, and multi-surface grip outsole. Perfect for gym sessions and agility workouts.",
    priceRange: {
      min: 79.99,
      max: 119.99,
    },
    keywords: ["training", "gym", "lightweight", "adaptive", "multi-surface", "cushioned"],
    colors: ["Black", "Gray", "Red"],
    similarProducts: [
      { id: "prod-111", similarity: 0.93 },
      { id: "prod-222", similarity: 0.89 },
      { id: "prod-333", similarity: 0.84 },
    ],
    imageSource: "https://m.media-amazon.com/images/I/61utX8kBDlL._SY695_.jpg",
    amazonSource: "https://www.amazon.in/ASIAN-Wonder-Firozi-Sports-Indian/dp/B01N3CUF47?source=ps-sl-shoppingads-lpcontext&ref_=fplfs&smid=A3OZBP9WERCHBG&th=1&psc=1"
  },
  {
    id:1,
    category: "Apparel - Sports T-Shirt",
    title: "ActiveDry Performance Sports T-Shirt",
    description:
      "Lightweight, breathable sports t-shirt with sweat-wicking fabric and ergonomic seams for enhanced movement. Ideal for running, gym, and outdoor activities.",
    priceRange: {
      min: 29.99,
      max: 49.99,
    },
    keywords: ["t-shirt", "sportswear", "breathable", "sweat-wicking", "lightweight", "active"],
    colors: ["Navy", "White", "Olive"],
    similarProducts: [
      { id: "prod-444", similarity: 0.91 },
      { id: "prod-555", similarity: 0.86 },
      { id: "prod-666", similarity: 0.82 },
    ],
    imageSource: "https://m.media-amazon.com/images/I/61O3aqjfanL._SY879_.jpg",
    amazonSource: "https://www.amazon.in/Boldfit-Mens-Regular-T-Shirt-BFTBM3001SBGL_Green/dp/B0CVX63K41?ref_=Oct_d_orecs_d_1968067031_0&pd_rd_w=HJ2m2&content-id=amzn1.sym.033cf816-138f-4ed6-a2fb-038383a72f79&pf_rd_p=033cf816-138f-4ed6-a2fb-038383a72f79&pf_rd_r=BWH4P5V2BF1VKSJ22595&pd_rd_wg=Evfeg&pd_rd_r=335d34a5-b599-41a0-add2-8ac03d88b3c5&pd_rd_i=B0CVX63K41&th=1&psc=1"
  }
]
}
