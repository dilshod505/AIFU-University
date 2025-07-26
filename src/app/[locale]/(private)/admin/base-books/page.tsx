import React from "react";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import BaseBooks from "@/components/pages/admin/base-books";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("Admin Dashboard"),
    description: t("AIFU - Admin BaseBooks"),
  };
};

const Page = () => {
  return (
    <div>
      <BaseBooks />
    </div>
  );
};

export default Page;
