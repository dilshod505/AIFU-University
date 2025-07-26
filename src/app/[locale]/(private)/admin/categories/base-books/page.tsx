import React from "react";
import BaseBooks from "@/components/pages/admin/categories/base-books";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { api } from "@/components/models/axios";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("Categories of Base Books"),
    description: t("AIFU - Categories of Base Books"),
  };
};

const getCategories = async () => {
  const res = await api.get("/admin/base-book/categories");

  return [];
};

const Page = () => {
  const categories = [];

  return <BaseBooks />;
};

export default Page;
