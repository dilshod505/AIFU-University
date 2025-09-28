import React from "react";
import Profile from "@/components/pages/super-admin/profile";
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
    title: t("Profile"),
    description: t("AIFU - Profile"),
  };
};

const Page = () => {
  return (
    <div>
      <Profile />
    </div>
  );
};

export default Page;
