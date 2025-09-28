import React from "react";
import BaseBooks from "@/components/pages/super-admin/base-books";
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
    title: t("Base Book"),
    description: t("AIFU - Base Book"),
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
