import React from "react";
import Login from "@/components/pages/login";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import SignUp from "@/components/pages/sign-up";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("Sign Up"),
    description: t("AIFU - Sign Up"),
  };
};

const Page = () => {
  return <SignUp />;
};

export default Page;
