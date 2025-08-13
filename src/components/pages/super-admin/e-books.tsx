"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { AutoForm, FormField } from "@/components/form/auto-form";
import MyTable, { IColumn } from "@/components/my-table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import TooltipBtn from "@/components/tooltip-btn";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { Image } from "antd";
import ReactPaginate from "react-paginate";
import { Button } from "@/components/ui/button";

const EBaseBooks = () => {
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: books, isLoading } = useQuery({
    queryKey: ["pdf-books", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await api.get(
        `/admin/pdfbooks/list?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      );
      return data;
    },
  });

  const [open, setOpen] = useState(false);
  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Title"),
        name: "title",
        type: "text",
        required: true,
      },
    ],
    [t],
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        dataIndex: "index",
        title: "#",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: t("kitob muqovasi"),
        dataIndex: "imageUrl",
        key: "imageUrl",
        render: (imageUrl: string) => (
          <Image
            src={imageUrl}
            width={70}
            height={70}
            alt={imageUrl}
            className="w-10 h-10 object-cover rounded-full"
          />
        ),
      },
      {
        key: "title",
        dataIndex: "title",
        title: t("Title"),
      },
      {
        key: "author",
        dataIndex: "author",
        title: t("Author"),
      },
      {
        key: "Category",
        dataIndex: ["categoryPreviewDTO", "name"],
        title: t("Category"),
      },
      // {
      //   key: "givenAt",
      //   dataIndex: "givenAt",
      //   title: t("Given At"),
      // },
      // {
      //   key: "dueDate",
      //   dataIndex: "dueDate",
      //   title: t("Due Date"),
      // },
      // {
      //   key: "status",
      //   dataIndex: "status",
      //   title: t("status"),
      //   render: (status: string) => (
      //     <div className={"flex justify-start items-center gap-2"}>
      //       <span
      //         className={`px-2 py-1 rounded text-xs ${
      //           status === "OVERDUE"
      //             ? "bg-red-100 text-red-600"
      //             : status === "APPROVED"
      //               ? "bg-green-100 text-green-600"
      //               : "bg-gray-100 text-gray-600"
      //         }`}
      //       >
      //         {t(status)}
      //       </span>
      //     </div>
      //   ),
      // },
      {
        title: t("actions"),
        dataIndex: "actions",
        render: (_: any, record: any) => (
          <div className={"flex justify-start items-center gap-2"}>
            <TooltipBtn
              variant={"ampersand"}
              size={"sm"}
              title={t("See")}
              onClick={() => {
                setOpen(true);
              }}
            >
              <Eye />
            </TooltipBtn>
          </div>
        ),
      },
    ],
    [t],
  );

  const onSubmit = async (data: any) => {};

  return (
    <div>
      <h1 className={"text-2xl font-semibold py-5"}>{t("E-Base-Books")}</h1>
      <MyTable
        columns={columns}
        isLoading={isLoading}
        dataSource={books?.data?.data || []}
        pagination={false}
        // header={
        //   <TooltipBtn
        //     title={t("Add Category")}
        //     onClick={() => {
        //       setOpen(true);
        //     }}
        //   >
        //     <Plus />
        //     {t("Add Category")}
        //   </TooltipBtn>
        // }
      />

      {/* Pagination */}
      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => {
          const newPageNum = e.selected + 1;
          setPageNumber(newPageNum);
        }}
        pageRangeDisplayed={pageSize}
        pageCount={Math.ceil((books?.data?.totalElements || 0) / pageSize)}
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
        className={"flex justify-center gap-2 items-center my-5"}
        renderOnZeroPageCount={null}
        forcePage={pageNumber - 1}
        pageClassName="px-3 py-1 rounded-full border cursor-pointer"
        activeClassName="bg-green-600 text-white rounded-full"
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <div className="p-3">
            <AutoForm
              onSubmit={onSubmit}
              form={form}
              fields={fields}
              showResetButton={false}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EBaseBooks;
