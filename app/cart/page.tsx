'use client';

import { useKart } from '@/hooks/useKart';
import { useState, useEffect } from 'react';
import { X, Sun, Moon, ShoppingCart, Trash2, ExternalLink } from 'lucide-react';
import ImageCarousel from '../components/imagescroller';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function KartPage() {
  const { kart, handleRemoveFromKart } = useKart();
  const [kartItems, setKartItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    const stored = localStorage.getItem('kart');
    if (stored) {
      setKartItems(JSON.parse(stored));
    }
  }, [kart]);

  const removeItem = (item: any) => {
    handleRemoveFromKart(item);
    setKartItems(prev => prev.filter((i: any) => i.id !== item.id));
  };

  if (!hasMounted) return null;

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative p-4 md:p-6">
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4">
        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="p-2 rounded bg-primary text-primary-foreground hover:bg-primary/80"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <ShoppingCart className="mr-3 h-8 w-8" />
            Your Shopping Cart
          </h1>
          <p className="text-muted-foreground">
            {kartItems.length} {kartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {kartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-muted rounded-full p-6 mb-6">
              <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Looks like you haven't added anything to your cart yet
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kartItems.map((item: any, index: number) => (
              <Card
                key={index}
                className="rounded-xl border border-border bg-card text-card-foreground shadow-md transition-all flex flex-col"
              >
                <div className="relative">
                  <div className="w-full aspect-[3/4] max-h-[240px] mb-6 overflow-hidden rounded-lg">
  <ImageCarousel images={item.images_Urls} />
</div>
                  <button
                    onClick={() => removeItem(item)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <p className="text-base font-bold line-clamp-1">
                      {item.productDisplayName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.brand} • {item.gender}
                    </p>

                    <div className="flex items-baseline mb-3">
                      <span className="text-lg font-bold">
                        ₹{item.discountedPrice}
                      </span>
                      {item.discountedPrice < item.price && (
                        <span className="text-xs line-through text-muted-foreground ml-2">
                          ₹{item.price}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between gap-2 mt-auto">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedItem(item)}
                    >
                      Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => window.open(item.landingPageUrl, "_blank")}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-1 rounded-full bg-muted hover:bg-muted-foreground/10"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="w-full h-80 mb-6">
                <ImageCarousel images={selectedItem.images_Urls} />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedItem.productDisplayName}</h2>
                  <p className="text-muted-foreground">
                    {selectedItem.brand} • {selectedItem.gender}
                  </p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">
                    ₹{selectedItem.discountedPrice}
                  </span>
                  {selectedItem.discountedPrice < selectedItem.price && (
                    <span className="text-sm line-through text-muted-foreground ml-2">
                      ₹{selectedItem.price}
                    </span>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-medium mb-2">Description</h3>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedItem.colors) &&
                    typeof selectedItem.colors[0] === "string"
                      ? selectedItem.colors.map((c: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs rounded-full bg-muted"
                          >
                            {c}
                          </span>
                        ))
                      : selectedItem.colors.map((c: any, i: number) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(c.BuyLink, "_blank")}
                          >
                            {c.Color}
                          </Button>
                        ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-border">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    removeItem(selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.open(selectedItem.landingPageUrl, "_blank")}
                >
                  Buy Now <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}