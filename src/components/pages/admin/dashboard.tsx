"use client";

import { useTranslations } from "next-intl";

const Dashboard = () => {
  const t = useTranslations();

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Dashboard")}</h1>
      <div className="grid grid-cols-4 gap-5">
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          1
        </div>
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          2
        </div>
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          3
        </div>
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          4
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
