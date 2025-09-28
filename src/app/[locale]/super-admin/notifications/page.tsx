import Notifications from "@/components/pages/super-admin/notifications";
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
    title: t("Notification"),
    description: t("AIFU - Notification"),
  };
};

const Page = () => {
  return (
    <div>
      <Notifications />
    </div>
  );
};

export default Page;
