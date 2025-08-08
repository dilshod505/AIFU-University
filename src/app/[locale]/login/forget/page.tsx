import React from "react";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ForgetPassword from "@/components/pages/forget";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("Recover password"),
    description: t("AIFU - Recover password"),
  };
};

const Page = () => {
  return <ForgetPassword />;
};

export default Page;
