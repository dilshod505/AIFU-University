import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Administrators from "@/components/pages/super-admin/administrators";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("System Administrators"),
    description: t("AIFU - System Administrators"),
  };
};

const Page = () => {
  return <Administrators />;
};

export default Page;
