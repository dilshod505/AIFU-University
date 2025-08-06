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
import ReactPaginate from "react-paginate";
import { Button } from "@/components/ui/button";
import { Divider } from "antd";

const PdfBooks = () => {
  const searchParams = useSearchParams();
  const queryParams = new URLSearchParams(searchParams);
  const [pageNum, setPageNum] = useState<number>(
    Number(searchParams.get("pageNum")) || 1,
  );
  const [pageSize, setPageSize] = useState<number>(
    Number(searchParams.get("pageSize")) || 9,
  );
  console.log(queryParams);

  const { data: books, isLoading } = usePdfBooksList({ pageNum, pageSize });

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5 text-start"}>
        <SimpleTranslation title={""} hasLocale />
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {books?.data?.data.map((book: Record<string, any>, i: number) => (
          <Link
            href={`/${book?.id}`}
            key={i}
            className="rounded-lg shadow-md p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  src={logo}
                  alt={book?.title}
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
                      {book?.categoryPreviewDTO?.name}
                    </Badge>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-6 w-32 mb-1" />
                  ) : (
                    <p className="text-lg font-semibold mb-1">{book?.title}</p>
                  )}
                  {isLoading ? (
                    <Skeleton className="h-6 w-28" />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {book?.author}
                      <span className="mx-2">|</span>
                      <span className="text-gray-600">
                        {book?.categoryPreviewDTO.name}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500">{book?.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <Divider />
      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => {
          setPageNum(e.selected + 1);
          queryParams.set("pageNum", String(e.selected + 1));
        }}
        pageRangeDisplayed={pageSize}
        pageCount={books?.data?.totalElements / pageSize || 0}
        previousLabel={<Button>Previous</Button>}
        nextLabel={<Button>Next</Button>}
        className={"flex justify-center gap-3 items-center"}
        renderOnZeroPageCount={null}
        forcePage={pageNum - 1}
      />
    </div>
  );
};

export default PdfBooks;
