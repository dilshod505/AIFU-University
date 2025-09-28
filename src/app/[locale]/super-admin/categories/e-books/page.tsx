import React from "react";
import EBookCategories from "@/components/pages/super-admin/categories/e-books";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("Categories of E-books"),
    description: t("AIFU - Categories of E-books"),
  };
};

const Page = async () => {
  return <EBookCategories />;
};

export default Page;
