import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import LandingWrapper from "@/components/pages/landing/landing-wrapper";

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
  return <LandingWrapper />;
};

export default Page;
