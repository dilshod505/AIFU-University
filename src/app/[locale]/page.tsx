import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import PdfBooks from "@/components/pages/user/pdf-books";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: "AIFU University",
    description: t(
      `Aniq va ijtimoiy fanlar universitetining kutubxona bo'limi`,
    ),
  };
};

const Page = async () => {
  return <PdfBooks />;
};

export default Page;
