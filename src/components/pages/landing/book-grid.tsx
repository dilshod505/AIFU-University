"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { useTranslations } from "next-intl";
import { TextAnimate } from "@/components/magicui/text-animate";

export function BookGrid({ categoryId }: { categoryId?: string | number }) {
  const t = useTranslations();

  const { data: books } = useQuery({
    enabled: !!categoryId,
    queryKey: ["books", categoryId],
    queryFn: async () => {
      const res = await api.get(`/client/pdf-books?category=${categoryId}`);
      return res.data;
    },
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            <TextAnimate animation="blurInUp" as="h1">
              {t("All Books")}
            </TextAnimate>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            <TextAnimate animation="blurInUp" as="h1">
              {t("Browse our complete collection of carefully selected titles")}
            </TextAnimate>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books?.data?.data.map((book: any) => (
            <Card
              key={book.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card border-border"
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={book.imageUrl || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {book.isNew && (
                    <Badge className="absolute top-3 left-3 bg-orange-500 text-white">
                      New
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="px-4">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {book.category}
                  </Badge>

                  <h3 className="font-serif font-bold text-foreground mb-1 line-clamp-2 group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    by {book.author}
                  </p>

                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">{book.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
