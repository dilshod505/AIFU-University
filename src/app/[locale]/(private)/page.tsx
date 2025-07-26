import { api } from "@/components/models/axios";
import SimpleTranslation from "@/components/simple-translation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

const getBooks = async () => {
  const response = await api.get(`/book`);
  return response.data;
};

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
  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5 text-start"}>
        <SimpleTranslation title={""} />
      </h1>
    </div>
  );
};

export default Page;
