"use client";

import { api } from "@/components/models/axios";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import bookPlaceholder from "../../../../public/book-placeholder.png";
import Link from "next/link";

export function FeaturedBooks() {
  const t = useTranslations();
  const { data } = useQuery({
    queryKey: ["new-books"],
    queryFn: async () => {
      const res = await api.get("/client/new-books");
      return res.data;
    },
    select: (data) => data.data,
  });

  return (
    <section className="pb-10 pt-20 bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="cont">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            {t("Featured Picks of the Month")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t(
              "Handpicked selections from our curators - the books everyone's talking about",
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 cont gap-8">
          {data?.map((book: Record<string, any>, i: number) => (
            <div key={i} className="overflow-hidden transition-all group">
              <Link href={`/books/${book.id}`}>
                <div className="relative rounded-xl overflow-hidden bg-white shadow-sm group-hover:shadow-lg">
                  <Image
                    src={
                      book?.imageUrl?.toString()?.startsWith("http")
                        ? book?.imageUrl
                        : bookPlaceholder
                    }
                    alt={book?.title}
                    width={400}
                    height={200}
                    priority
                    quality={100}
                    className="w-full h-60 object-cover bg-center rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105"
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
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
