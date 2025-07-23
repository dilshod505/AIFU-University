"use client";

import React, { useMemo } from "react";
import MyTable, { IColumn } from "@/components/my-table";
import { useTranslations } from "next-intl";

const Users = () => {
  const t = useTranslations();
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
        dataSource={[{ index: 1 }, { index: 2 }, { index: 3 }, { index: 4 }]}
        searchable
        columnVisibility
        // bordered
        // size={"large"}
        // footer={() => <h1>asdasd</h1>}
        fullscreen
        striped
      />
    </div>
  );
};

export default Users;
