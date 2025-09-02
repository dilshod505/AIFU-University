"use client";
import { api } from "@/components/models/axios";
import { usePdfBooksList } from "@/components/models/queries/pdf-books";
import SimpleTranslation from "@/components/simple-translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Divider } from "antd";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid3X3,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import bookPlaceholder from "../../../../public/book-placeholder.png";

const BookSkeleton = () => (
  <div className="overflow-hidden transition-all group">
    <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
      <Skeleton className="w-full h-48 rounded-lg" />
      <div className="absolute top-3 left-3">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <span className="text-muted-foreground">•</span>
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  </div>
);

const PdfBooks = () => {
  const t = useTranslations();
  const [pageNum, setPageNum] = useState<number>(1);
  const isMobile = useIsMobile();
  const [pageSize, setPageSize] = useState<number>(18);
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: books, isLoading } = usePdfBooksList({
    pageNum,
    pageSize,
    category: selectedCategory ? +selectedCategory : undefined,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/client/categories");
      return res.data;
    },
    select: (data: Record<string, any>): Record<string, any> => data?.data,
  });

  const handleCategorySelect = (categoryId: string | null) => {
    searchParams.set("category", categoryId || "");
    setSelectedCategory(categoryId);
    setPageNum(1); // Reset to first page when category changes
  };

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => console.log(selectedCategory), [selectedCategory]);

  return (
    <div className="cont py-5">
      <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => handleCategorySelect(null)}
              className={cn(
                "rounded-full px-6 py-2 transition-all duration-200 hover:scale-105",
                selectedCategory === null
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "hover:bg-primary/10",
              )}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Barcha kitoblar
            </Button>

            {/* Category Buttons */}
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))
              : categories?.map((category: Record<string, any>) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory && +selectedCategory === category.id
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                      "rounded-full px-6 py-2 transition-all duration-200 hover:scale-105",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "hover:bg-primary/10",
                    )}
                  >
                    {category.name}
                    {category.bookCount && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.bookCount}
                      </Badge>
                    )}
                  </Button>
                ))}
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {isLoading
          ? Array.from({ length: pageSize }).map((_, i) => (
              <BookSkeleton key={i} />
            ))
          : books?.data?.data.map((book: Record<string, any>, i: number) => (
              <Link href={`/books/${book?.id}`} key={i}>
                <div className="overflow-hidden transition-all ">
                  <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
                    <Image
                      src={book?.imageUrl || bookPlaceholder}
                      alt={book?.title}
                      width={400}
                      height={200}
                      priority
                      quality={100}
                      className="w-full h-48 object-cover rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg"
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
              </Link>
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && (!books?.data?.data || books?.data?.data.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kitoblar topilmadi</h3>
            <p className="text-muted-foreground">
              {selectedCategory
                ? "Tanlangan kategoriyada kitoblar mavjud emas"
                : "Hozircha kitoblar mavjud emas"}
            </p>
          </CardContent>
        </Card>
      )}

      <Divider className="my-8" />

      {/* Pagination */}
      {books?.data?.data && books?.data?.data.length > 0 && (
        <ReactPaginate
          breakLabel="..."
          onPageChange={(e) => {
            const newPageNum = e.selected + 1;
            setPageNum(newPageNum);
          }}
          pageRangeDisplayed={pageSize}
          pageCount={Math.ceil((books?.data?.totalElements || 0) / pageSize)}
          previousLabel={
            <Button className={"bg-white text-black"}>
              <ChevronLeft />
              {t("Previous")}
            </Button>
          }
          nextLabel={
            <Button className={"bg-white text-black"}>
              {t("Next")} <ChevronRight />
            </Button>
          }
          className={"flex justify-center gap-2 items-center my-5"}
          renderOnZeroPageCount={null}
          forcePage={pageNum - 1}
          pageClassName="list-none"
          pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
          activeLinkClassName="bg-green-600 text-white rounded-full"
        />
      )}
    </div>
  );
};

export default PdfBooks;
