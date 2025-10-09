// import React from "react";
// import { Metadata } from "next";
// import { getTranslations } from "next-intl/server";
// import Settings from "@/components/pages/super-admin/settings";
//
// export const generateMetadata = async ({
//   params,
// }: {
//   params: Promise<{ locale: string }>;
// }): Promise<Metadata> => {
//   const { locale } = await params;
//   const t = await getTranslations({ locale });
//
//   return {
//     title: t("Settings"),
//     description: t("AIFU - Settings"),
//   };
// };
//
// const Page = () => {
//   return (
//     <div>
//       <Settings />
//     </div>
//   );
// };
//
// export default Page;
