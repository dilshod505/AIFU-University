import BaseBooks from "@/components/pages/super-admin/categories/base-books";
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
    title: t("Categories of Base Books"),
    description: t("AIFU - Categories of Base Books"),
  };
};

const Page = async () => {
  return <BaseBooks />;
};

export default Page;
