"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import MyTable, { type IColumn } from "@/components/my-table";
import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import TooltipBtn from "@/components/tooltip-btn";
import Link from "next/link";
import { Undo2 } from "lucide-react";
import useLayoutStore from "@/store/layout-store";
import { Tag } from "antd";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "active"; // default active
  const t = useTranslations();

  const columns = useMemo<IColumn[]>(() => {
    const baseColumns: IColumn[] = [
      {
        key: "index",
        title: "#",
        dataIndex: "index",
        width: 50,
        render: (_: any, __: any, index: number) => index + 1,
      },
      { key: "name", title: t("Name"), dataIndex: "name" },
      { key: "surname", title: t("Surname"), dataIndex: "surname" },
      {
        key: "title",
        title: t("Title"),
        dataIndex: type === "archive" ? "bookTitle" : "title", // ✅ farqladik
      },
      { key: "author", title: t("Author"), dataIndex: "author" },
      { key: "givenAt", title: t("Given Date"), dataIndex: "givenAt" },
      { key: "dueDate", title: t("Due Date"), dataIndex: "dueDate" },
    ];

    if (type === "archive") {
      baseColumns.push({
        key: "returnedAt",
        title: t("Returned Date"),
        dataIndex: "returnedAt",
      });
      baseColumns.splice(3, 0, {
        key: "inventoryNumber",
        title: t("Inventory №"),
        dataIndex: "inventoryNumber",
      });
    } else {
      baseColumns.push({
        key: "status",
        title: t("Status"),
        dataIndex: "status",
        render: (status: string) => (
          <Tag color={status === "APPROVED" ? "green" : "red"}>{t(status)}</Tag>
        ),
      });
    }

    return baseColumns;
  }, [t, type]);

  const { data, isLoading } = useQuery({
    queryKey: ["user-bookings", id, type],
    queryFn: async () => {
      if (type === "archive") {
        const res = await api.get("/admin/history", {
          params: {
            field: "student",
            query: id,
            pageNumber: 1,
            pageSize: 10,
            sortDirection: "desc",
          },
        });
        return res.data.data;
      } else {
        const res = await api.get("/admin/booking", {
          params: {
            field: "student",
            query: id,
            filter: "all",
            pageNum: 1,
            pageSize: 10,
            sortDirection: "desc",
          },
        });
        return res.data.data;
      }
    },
    enabled: !!id,
  });

  const { user } = useLayoutStore();
  const role = user?.role?.toString().toLowerCase().replace("_", "-");

  return (
    <div className="p-4">
      <MyTable
        title={
          <h1 className="text-xl font-bold">
            {type === "archive" ? t("Archive bronlar") : t("Active bronlar")}
          </h1>
        }
        header={
          <>
            <div className={"flex items-center justify-start"}>
              {role === "admin" && (
                <Link href={"/admin/users"}>
                  <TooltipBtn title={t("Return")}>
                    <Undo2 />
                  </TooltipBtn>
                </Link>
              )}
              {role === "super-admin" && (
                <Link href={"/super-admin/users/students"}>
                  <TooltipBtn title={t("Return")}>
                    <Undo2 />
                  </TooltipBtn>
                </Link>
              )}
            </div>
          </>
        }
        columns={columns}
        dataSource={data?.data || []}
        isLoading={isLoading}
        pagination={{
          total: data?.totalElements,
          pageSize: 10,
        }}
      />
    </div>
  );
}
