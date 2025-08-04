import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Users from "@/components/pages/admin/users";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: t("System Users"),
    description: t("AIFU - System Users"),
  };
};

const Page = () => {
  return <Users />;
};

export default Page;
