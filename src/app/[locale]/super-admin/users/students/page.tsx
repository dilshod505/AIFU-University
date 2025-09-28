import Students from "@/components/pages/super-admin/students";
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
    title: t("Students"),
    description: t("AIFU - Students"),
  };
};

const Page = () => {
  return <Students />;
};

export default Page;
