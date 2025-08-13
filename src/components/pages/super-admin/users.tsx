"use client";

import React, { useMemo, useState } from "react";
import MyTable, { IColumn } from "@/components/my-table";
import { useTranslations } from "next-intl";
import { useStudents } from "@/components/models/queries/students";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ReactPaginate from "react-paginate";
import { Divider } from "antd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type FilterType = "all" | "active" | "inactive";

const Users = () => {
  const t = useTranslations();
  const [filter, setFilter] = useState<FilterType>("all");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [size, setSize] = useState<10 | 25 | 50 | 100>(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { data: students, isLoading } = useStudents({
    filter,
    pageNumber,
    size,
    sortDirection,
  });

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        title: "#",
        dataIndex: "index",
        width: 50,
        render: (_: any, __: any, index: number) => index + 1,
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
        dataSource={students?.data || []}
        columnVisibility
        isLoading={isLoading}
        pagination={false}
        size={"large"}
        striped
        header={
          <div className={"flex justify-start items-center gap-2 flex-wrap"}>
            <Select
              value={size.toString()}
              onValueChange={(a: string) => setSize(Number(a) as any)}
            >
              <SelectTrigger suppressHydrationWarning>
                <Tooltip>
                  <TooltipTrigger>
                    <SelectValue placeholder={size} />
                  </TooltipTrigger>
                  <TooltipContent sideOffset={5}>
                    {t("select data size")}
                  </TooltipContent>
                </Tooltip>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"10"}>10</SelectItem>
                <SelectItem value={"25"}>25</SelectItem>
                <SelectItem value={"50"}>50</SelectItem>
                <SelectItem value={"100"}>100</SelectItem>
              </SelectContent>
            </Select>
            {sortDirection === "asc" ? (
              <Button size={"sm"} onClick={() => setSortDirection("desc")}>
                <ArrowUpWideNarrow />
              </Button>
            ) : (
              <Button size={"sm"} onClick={() => setSortDirection("asc")}>
                <ArrowDownWideNarrow />
              </Button>
            )}
            <Tabs
              value={filter}
              onValueChange={(a: string) => setFilter(a as any)}
            >
              <TabsList>
                <TabsTrigger value={"all"}>{t("All")}</TabsTrigger>
                <TabsTrigger value={"active"}>{t("Active")}</TabsTrigger>
                <TabsTrigger value={"inactive"}>{t("Inactive")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
      />
      <Divider />
      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => {
          setPageNumber(e.selected + 1);
        }}
        pageRangeDisplayed={size}
        pageCount={Math.ceil(students?.totalElements / size) || 0}
        previousLabel={
          <Button className={"bg-white text-black"}>
            <ChevronLeft />
            {t("Return")}
          </Button>
        }
        nextLabel={
          <Button className={"bg-white text-black"}>
            {t("Next")} <ChevronRight />
          </Button>
        }
        className={"flex justify-center gap-3 items-center my-5"}
        pageClassName="px-3 py-1 rounded-full border cursor-pointer"
        activeClassName="bg-green-600 text-white rounded-full"
        renderOnZeroPageCount={null}
        forcePage={pageNumber > 0 ? pageNumber - 1 : 0}
      />
    </div>
  );
};

export default Users;
