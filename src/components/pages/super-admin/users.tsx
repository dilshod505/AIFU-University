"use client";

import React, { useMemo } from "react";
import MyTable, { IColumn } from "@/components/my-table";
import { useTranslations } from "next-intl";
import { useStudents } from "@/components/models/queries/students";
import { Badge } from "@/components/ui/badge";

const Users = () => {
  const t = useTranslations();
  const { data: students, isLoading } = useStudents();

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        title: "#",
        dataIndex: "index",
        width: 50,
      },
      {
        key: "name",
        title: t("firstName"),
        dataIndex: "name",
      },
      {
        key: "surname",
        title: t("lastName"),
        dataIndex: "surname",
      },
      {
        key: "cardNumber",
        title: t("Card number"),
        dataIndex: "cardNumber",
      },
      {
        key: "status",
        title: t("status"),
        dataIndex: "status",
        render: (value: boolean) => (
          <Badge variant={value ? "default" : "destructive"}>
            {value ? t("Active") : t("Inactive")}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <div>
      <h3 className={"text-2xl font-semibold py-5"}>{t("users")}</h3>
      <MyTable
        columns={columns}
        dataSource={students?.data?.data || []}
        searchable
        columnVisibility
        isLoading={isLoading}
        size={"large"}
        fullscreen
        striped
      />
    </div>
  );
};

export default Users;
