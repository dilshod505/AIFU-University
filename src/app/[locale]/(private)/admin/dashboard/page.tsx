import React from "react";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("Admin Dashboard"),
    description: t("AIFU - Admin Dashboard"),
  };
};

const Page = () => {
  return <div></div>;
};

export default Page;
