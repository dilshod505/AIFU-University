import React from "react";
import Login from "@/components/pages/login";
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
    title: t("Login"),
    description: t("AIFU - Login"),
  };
};

const Page = () => {
  return <Login />;
};

export default Page;
