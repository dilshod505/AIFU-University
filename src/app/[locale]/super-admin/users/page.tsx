import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Students from "@/components/pages/super-admin/students";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("System Students"),
    description: t("AIFU - System Students"),
  };
};

const Page = () => {
  return <Students />;
};

export default Page;
