"use client";

import React, { useState } from "react";
import SimpleTranslation from "@/components/simple-translation";
import { usePdfBooksList } from "@/components/models/queries/pdf-books";

const PdfBooks = () => {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const { data: books } = usePdfBooksList({ pageNum, pageSize });

  console.log(books);

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5 text-start"}>
        <SimpleTranslation title={""} hasLocale />
      </h1>
    </div>
  );
};

export default PdfBooks;
