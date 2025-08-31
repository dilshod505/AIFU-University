"use client";

import { TextAnimate } from "@/components/magicui/text-animate";
import { api } from "@/components/models/axios";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import bookPlaceholder from "../../../../public/book-placeholder.png";

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
    categoryId && (
      <section className="py-20 bg-background">
        <div className="cont">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              <TextAnimate animation="blurInUp">{t("All Books")}</TextAnimate>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              <TextAnimate animation="blurInUp">
                {t(
                  "Browse our complete collection of carefully selected titles"
                )}
              </TextAnimate>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
            {books?.data?.data.map((book: any) => (
              <Link href={`/books/${book.id}`}>
                <div
                  key={book.id}
                  className="overflow-hidden transition-all group"
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <Image
                      src={book.imageUrl || bookPlaceholder}
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
      </section>
    )
  );
}
