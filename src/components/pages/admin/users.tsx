"use client";

import React, { useMemo } from "react";
import MyTable, { IColumn } from "@/components/my-table";
import { useTranslations } from "next-intl";
import { useStudents } from "@/components/models/queries/students";

const Users = () => {
  const t = useTranslations();
  const { data: students, isLoading } = useStudents();
  console.log(students);
  console.log();

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        title: "#",
        dataIndex: "index",
        width: 50,
      },
    ],
    [],
  );

  return (
    <div className={"cont"}>
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
