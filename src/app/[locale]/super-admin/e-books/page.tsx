import React from "react";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import EBaseBooks from "@/components/pages/super-admin/e-books";

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
  return (
    <div>
      <EBaseBooks />
    </div>
  );
};

export default Page;
