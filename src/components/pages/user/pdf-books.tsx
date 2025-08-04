"use client";

import React, { useState } from "react";
import SimpleTranslation from "@/components/simple-translation";
import { usePdfBooksList } from "@/components/models/queries/pdf-books";
import Image from "next/image";
import logo from "../../../../public/img-bg.png";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const PdfBooks = () => {
  const queryParams = new URLSearchParams(useSearchParams());
  const [pageNum, setPageNum] = useState<number>(
    Number(queryParams.get("pageNum")) || 1,
  );
  const [pageSize, setPageSize] = useState<number>(
    Number(queryParams.get("pageSize")) || 10,
  );
  console.log(queryParams);

  const { data: books, isLoading } = usePdfBooksList({ pageNum, pageSize });

  console.log(books?.data);

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5 text-start"}>
        <SimpleTranslation title={""} hasLocale />
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {Array.from({ length: pageSize }).map((_, i: number) => (
          <Link
            href={`/${books?.data?.data?.[i].id}`}
            key={i}
            className="rounded-lg shadow-md p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={logo}
                  alt={books?.data?.data?.[i].title}
                  width={150}
                  height={150}
                  priority
                  quality={100}
                  className="w-full max-w-48 rounded-lg mr-4"
                />
                <div
                  className={
                    "flex flex-col justify-evenly h-full w-full items-start"
                  }
                >
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 mb-1" />
                  ) : (
                    <Badge className={"mb-1"}>
                      {books?.data?.data?.[i].categoryPreviewDTO?.name}
                    </Badge>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-6 w-32 mb-1" />
                  ) : (
                    <p className="text-lg font-semibold mb-1">
                      {books?.data?.data?.[i].title}
                    </p>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-6 w-28" />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {books?.data?.data?.[i]?.author}
                      <span className="mx-2">|</span>
                      <span className="text-gray-600">
                        {books?.data?.data?.[i]?.categoryPreviewDTO.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {books?.data?.data?.[i]?.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PdfBooks;
