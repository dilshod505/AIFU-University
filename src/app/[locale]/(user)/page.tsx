import LandingWrapper from "@/components/pages/landing/landing-wrapper";
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
    title: "AIFU University",
    description: t(
      `Aniq va ijtimoiy fanlar universitetining kutubxona bo'limi`
    ),
  };
};

const Page = () => {
  return <LandingWrapper />;
};

export default Page;
