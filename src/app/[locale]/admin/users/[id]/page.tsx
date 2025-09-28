import StudentDetail from "@/components/pages/super-admin/studentDetail";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> => {
  const { locale, id } = params;
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
