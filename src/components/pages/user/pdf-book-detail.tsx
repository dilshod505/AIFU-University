"use client";

import { api } from "@/components/models/axios";
import { usePdfBookId } from "@/components/models/queries/pdf-books";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import bookPlaceholder from "../../../../public/book-placeholder.png";

const PdfBookDetail = () => {
  const t = useTranslations();
  const { id } = useParams();
  const { data: book } = usePdfBookId({ id: id?.toString() || "" });
  const pdfBooks = useQuery({
    enabled: !!book,
    queryKey: ["pdf-books", book],
    queryFn: async () => {
      const res = await api.get(
        `/client/pdf-books?category=${book.categoryPreview.id}`
      );
      return res.data;
    },
    select: (data) => data.data?.data,
  });

  return book ? (
    <div className="max-w-6xl mx-auto p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Левый столбец: обложка и действия */}
        <aside className="md:col-span-1 flex flex-col items-center">
          <div className="w-full shadow-lg rounded-2xl overflow-hidden">
            <Image
              width={400}
              height={600}
              priority
              src={book.imageUrl}
              alt={`Обложка книги ${book.title} — ${book.author}`}
              className="w-full h-96 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  {t("pages count")}: {book.pageCount}
                </span>
                <span className="text-sm font-medium">{book.size} MB</span>
              </div>
              <div className="flex flex-col gap-2">
                {book.pdfUrl && (
                  <>
                    <Link
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center px-4 py-2 border rounded-lg font-semibold hover:shadow"
                    >
                      {t("read online")}
                    </Link>
                    <Link
                      href={book.pdfUrl}
                      download
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      {t("download PDF")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Правый столбец: информация о книге */}
        <main className="md:col-span-2 p-6 rounded-2xl shadow">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold leading-tight">{book.title}</h1>
              <p className="mt-2 text-lg text-gray-700">
                {book.author} •{" "}
                <span className="text-base text-gray-500">
                  {book.categoryPreview?.name}
                </span>
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {t("Publication year")}
                </div>
                <div className="font-semibold">{book.publicationYear}</div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">{t("createdAt")}</div>
                <div className="font-semibold">{book.createdDate}</div>
              </div>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <MetaRow label={t("Isbn")} value={book.isbn} />
              <MetaRow label={t("Publisher")} value={book.publisher} />
              <MetaRow label={t("Language")} value={book.language} />
            </div>

            <div className="space-y-2">
              <MetaRow label={t("script")} value={book.script} />
              <MetaRow
                label={t("pages count")}
                value={String(book.pageCount)}
              />
              <MetaRow label={t("size")} value={`${book.size} MB`} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-xl font-semibold">{t("Description")}</h3>
            <p className="mt-2 text-gray-500">{book.description}</p>
          </section>
        </main>
      </div>
      <section>
        <Card className={"shadow-lg"}>
          <CardHeader>
            <CardTitle>{t("Shu kategoriyadagi boshqa kitoblar")}</CardTitle>
            <CardDescription className={"hidden"} />
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 px-6 gap-3">
            {pdfBooks.data
              ?.slice(0, 7)
              ?.filter((b: Record<string, any>) => b.id !== book?.id)
              ?.map((book: Record<string, any>, i: number) => (
                <Link href={`/books/${book?.id}`} key={i}>
                  <div className="overflow-hidden transition-all group">
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
        </Card>
      </section>
    </div>
  ) : (
    <div className="absolute bg-white top-0 left-0 z-50 flex justify-center items-center h-screen w-full gap-3  ">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      <p className="ml-2 text-black">{t("loading")}...</p>
    </div>
  );
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

export default PdfBookDetail;
