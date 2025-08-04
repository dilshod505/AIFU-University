import React from "react";
import { useTranslations } from "next-intl";

const Notifications = () => {
  const t = useTranslations();

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Notifications")}</h1>
    </div>
  );
};

export default Notifications;
