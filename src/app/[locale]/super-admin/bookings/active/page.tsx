import React from "react";
import ActiveBookingsPage from "@/components/pages/super-admin/bookings/active";
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
    title: t("Booking Active"),
    description: t("AIFU - Booking Active"),
  };
};

const Page = () => {
  return <ActiveBookingsPage />;
};

export default Page;
