import React from "react";
import HistoryPage from "@/components/pages/super-admin/bookings/history";
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
    title: t("Booking Archived"),
    description: t("AIFU - Booking Archived"),
  };
};

const Page = () => {
  return <HistoryPage />;
};

export default Page;
