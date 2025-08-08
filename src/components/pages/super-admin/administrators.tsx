"use client";

import React, { useMemo, useState } from "react";
import MyTable, { IColumn } from "@/components/my-table";
import { useTranslations } from "next-intl";
import { useAdministrators } from "@/components/models/queries/students";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
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

const Administrators = () => {
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [size, setSize] = useState<10 | 25 | 50 | 100>(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { data: admins, isLoading } = useAdministrators({
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
        key: "status",
        title: t("status"),
        dataIndex: "status",
        render: (_: boolean, r: Record<string, any>) => (
          <Badge variant={r.active ? "default" : "destructive"}>
            {r.active ? t("Active") : t("Inactive")}
          </Badge>
        ),
      },
      // {
      //   key: "actions",
      //   title: t("actions"),
      //   dataIndex: "actions",
      //   render: (_: any, r: Record<string, any>) => (
      //     <TooltipBtn
      //       title={r.active ? t("Ban") : t("Unban")}
      //       variant={r.active ? "destructive" : "default"}
      //     >
      //       {r.active ? <Ban /> : <Check />}
      //     </TooltipBtn>
      //   ),
      // },
    ],
    [t],
  );

  return (
    <div>
      <h3 className={"text-2xl font-semibold py-5"}>{t("Administrators")}</h3>
      <MyTable
        columns={columns}
        dataSource={admins?.data || []}
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
        pageCount={Math.ceil(admins?.totalElements / size) || 0}
        previousLabel={<Button>{t("Previous")}</Button>}
        nextLabel={<Button>{t("Next")}</Button>}
        className={"flex justify-center gap-3 items-center"}
        renderOnZeroPageCount={null}
        forcePage={pageNumber > 0 ? pageNumber - 1 : 0}
      />
    </div>
  );
};

export default Administrators;
