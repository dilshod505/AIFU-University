"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import Image from "next/image";
import bookPlaceholder from "../../../../public/book-placeholder.png";
import { Marquee } from "@/components/magicui/marquee";

const featuredBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    price: "$14.99",
    originalPrice: "$19.99",
    rating: 4.8,
    reviews: 12847,
    image: "/midnight-library-cover.png",
    badge: "Bestseller",
    description:
      "A dazzling novel about all the choices that go into a life well lived.",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    price: "$16.99",
    originalPrice: "$22.99",
    rating: 4.9,
    reviews: 8934,
    image: "/atomic-habits-inspired-cover.png",
    badge: "Editor's Choice",
    description: "An easy & proven way to build good habits & break bad ones.",
  },
  {
    id: 3,
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: "$13.99",
    originalPrice: "$18.99",
    rating: 4.7,
    reviews: 15623,
    image: "/project-hail-mary-cover.png",
    badge: "New Release",
    description:
      "A lone astronaut must save the earth from disaster in this incredible new science-based thriller.",
  },
  {
    id: 3,
    title: "Project Hail Mary",
    author: "Andy Weir",
    price: "$13.99",
    originalPrice: "$18.99",
    rating: 4.7,
    reviews: 15623,
    image: "/project-hail-mary-cover.png",
    badge: "New Release",
    description:
      "A lone astronaut must save the earth from disaster in this incredible new science-based thriller.",
  },
];

export function FeaturedBooks() {
  const { data } = useQuery({
    queryKey: ["new-books"],
    queryFn: async () => {
      const res = await api.get("/client/new-books");
      return res.data;
    },
    select: (data) => data.data,
  });

  console.log(data);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            Featured Picks of the Month
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked selections from our curators - the books everyone's
            talking about
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 cont gap-8">
          {data?.map((book: Record<string, any>) => (
            <div className="overflow-hidden transition-all group">
              <div className="relative rounded-xl overflow-hidden bg-white shadow-sm group-hover:shadow-lg">
                <Image
                  src={book?.imageUrl || bookPlaceholder}
                  alt={book?.title}
                  width={400}
                  height={200}
                  priority
                  quality={100}
                  className="w-full h-60 object-cover rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                    {book?.categoryPreviewDTO?.name}
                  </Badge>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {book?.title}
                </h3>

                <div className="flex items-center text-xs flex-wrap text-muted-foreground mb-3">
                  <span>{book?.author}</span>
                  <span className="mx-2">•</span>
                  <span>{book?.categoryPreviewDTO?.name}</span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {book?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
