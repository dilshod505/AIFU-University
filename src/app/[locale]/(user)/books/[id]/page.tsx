import { baseBackendUrl } from "@/components/models/axios";
import PdfBookDetail from "@/components/pages/user/pdf-book-detail";
import axios from "axios";
import { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> => {
  const { id } = await params;
  const res = await axios.get(`${baseBackendUrl}/api/client/pdf-book/${id}`);
  return {
    title: res?.data?.data?.title + " - " + res?.data?.data?.author,
    description: res?.data?.data?.description,
  };
};

const Page = async () => {
  return <PdfBookDetail />;
};

export default Page;
