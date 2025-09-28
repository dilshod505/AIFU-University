import React from "react";
import Bookings from "@/components/pages/super-admin/bookings";
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
    title: t("Booking"),
    description: t("AIFU - Booking"),
  };
};

const Page = () => {
  return (
    <div>
      <Bookings />
    </div>
  );
};

export default Page;
