import StudentDetail from "@/components/pages/super-admin/studentDetail";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale });

  return {
    title: `${t("Student Detail")} - ${id}`,
    description: `${t("AIFU - Student Detail")} | User ID: ${id}`,
  };
};

const Page = () => {
  return <StudentDetail />;
};

export default Page;
