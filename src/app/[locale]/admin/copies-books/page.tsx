import React from "react";
import { CopiesBooks } from "@/components/pages/super-admin/copies-books";
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
    title: t("Copies Books"),
    description: t("AIFU - Copies Books"),
  };
};

const Page = () => {
  return (
    <div>
      <CopiesBooks />
    </div>
  );
};

export default Page;
