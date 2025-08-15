import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import PdfBookDetail from "@/components/pages/user/pdf-book-detail";
import axios from "axios";
import { cookies } from "next/headers";
import { baseBackendUrl } from "@/components/models/axios";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> => {
  const { locale, id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("aifu-token");
  const res = await axios.get(`${baseBackendUrl}/api/client/pdf-book/${id}`, {
    headers: {
      Authorization: `Bearer ${token?.value}`,
    },
  });
  const t = await getTranslations({ locale });

  return {
    title: res?.data?.data?.title + " - " + res?.data?.data?.author,
    description: res?.data?.data?.description,
  };
};

const Page = async () => {
  return <PdfBookDetail />;
};

export default Page;
