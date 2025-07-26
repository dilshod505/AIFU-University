"use client";

import { useTranslations } from "next-intl";

const Dashboard = () => {
  const t = useTranslations();

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Dashboard")}</h1>
    </div>
  );
};

export default Dashboard;
