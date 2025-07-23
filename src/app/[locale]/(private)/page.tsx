import { api } from "@/components/models/axios";
import SimpleTranslation from "@/components/simple-translation";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
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
    title: "AR BOOKS",
    description: t(
      `AR BOOKS is a platform for seeing augmented reality on books`,
    ),
  };
};

const Page = async () => {

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5 text-start"}>
        <SimpleTranslation title={"products"} />
      </h1>

    </div>
  );
};

export default Page;
