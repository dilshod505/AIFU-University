import React from "react";
import SimpleTranslation from "@/components/simple-translation";

const PdfBooks = () => {
  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5 text-start"}>
        <SimpleTranslation title={""} hasLocale />
      </h1>
    </div>
  );
};

export default PdfBooks;
