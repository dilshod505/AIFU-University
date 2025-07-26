import React from "react";
import BaseBooks from "@/components/pages/admin/categories/base-books";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { api } from "@/components/models/axios";
import EBooks from "@/components/pages/admin/categories/e-books";

// export const generateMetadata = async ({
//   params,
// }: {
//   params: Promise<{ locale: string }>;
// }): Promise<Metadata> => {
//   const { locale } = await params;
//   const t = await getTranslations({ locale });
//
//   return {
//     title: t("Categories of Base Books"),
//     description: t("AIFU - Categories of Base Books"),
//   };
// };
//
// const getCategories = async () => {
//   const res = await api.get("/admin/e-book/categories");
//   return res.data;
// };

const Page = async () => {
  // const categories = await getCategories();

  // console.log(categories);

  return <EBooks />;
};

export default Page;
