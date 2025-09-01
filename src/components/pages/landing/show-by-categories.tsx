"use client";

import { api } from "@/components/models/axios";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import bookPlaceholder from "../../../../public/book-placeholder.png";

export function ShopByCategory() {
  const t = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: ["books-by-category"],
    queryFn: async () => {
      const res = await api.get("/client/show-by-categories");
      return res.data;
    },
    select: (data) => data.data, // faqat kerakli `data`
  });

  if (isLoading) {
    return <p className="text-center py-10">Yuklanmoqda...</p>;
  }

  return (
    <section className="py-10 bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
      <div className="cont">
        {data?.map((categoryBlock: any) => (
          <div key={categoryBlock.category.id} className="my-10">
            {/* Category nomi */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground">
                {categoryBlock.category.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8">
              {categoryBlock.books.slice(0, 6).map((book: any) => (
                <Link href={`/books/${book.id}`} key={book.id}>
                  <div className="overflow-hidden transition-all group">
                    <div className="relative rounded-xl overflow-hidden">
                      <Image
                        src={
                          book?.imageUrl?.toString()?.startsWith("http")
                            ? book.imageUrl
                            : bookPlaceholder
                        }
                        alt={book.title}
                        width={400}
                        height={250}
                        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                          {book.categoryPreviewDTO?.name}
                        </Badge>
                      </div>
                    </div>

                    <div className="py-2">
                      <h3 className="text-lg font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {book.author}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
