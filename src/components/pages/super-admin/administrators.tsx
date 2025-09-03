"use client";

import { AutoForm, FormField } from "@/components/form/auto-form";
import {
  useAdministrators,
  useCreateAdministrator,
} from "@/components/models/queries/students";
import MyTable, { IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Divider } from "antd";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Ban,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

export type FilterType = "all" | "active" | "inactive";

const Administrators = () => {
  const t = useTranslations();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { data: admins, isLoading } = useAdministrators({
    pageNumber,
    sortDirection,
  });
  const createAdmin = useCreateAdministrator();

  const form = useForm();

  const fields = useMemo<FormField[]>(
    () => [
      {
        label: t("Name"),
        name: "name",
        type: "text",
        required: true,
      },
      {
        label: t("Surname"),
        name: "surname",
        type: "text",
        required: true,
      },
      {
        label: t("Email"),
        name: "email",
        type: "email",
        required: true,
      },
      {
        label: t("Password"),
        name: "password",
        type: "password",
        required: true,
      },
    ],
    [t]
  );

  const columns = useMemo<IColumn[]>(
    () => [
      {
        key: "index",
        title: "#",
        dataIndex: "index",
        width: 350,
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
        width: 500,
      },
      {
        key: "status",
        width: 300,
        title: t("status"),
        dataIndex: "status",
        render: (value: boolean) => (
          <div
            className={`w-7 h-6 rounded ${
              value ? "bg-green-500" : "bg-red-400"
            }`}
          />
        ),
      },
      {
        key: "actions",
        title: t("actions"),
        dataIndex: "actions",
        width: 150,
        render: (_: any, r: Record<string, any>) => (
          <TooltipBtn
            size={"sm"}
            title={r.isActive ? t("Ban") : t("Unban")}
            variant={r.isActive ? "destructive" : "default"}
          >
            {r.isActive ? <Ban /> : <Check />}
          </TooltipBtn>
        ),
      },
    ],
    [t]
  );

  const onSubmit = (data: any) => {
    createAdmin.mutate(
      {
        name: data.name,
        surname: data.surname,
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          toast.success(t("Administrator created successfully"));
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <div>
      <MyTable
        title={
          <h3 className={"text-2xl font-semibold py-5"}>
            {t("Administrators")}
          </h3>
        }
        columns={columns}
        dataSource={admins?.data || []}
        isLoading={isLoading}
        pagination={false}
        size={"large"}
        striped
        header={
          <div className={"flex justify-start items-center gap-2 flex-wrap"}>
            {sortDirection === "asc" ? (
              <Button size={"sm"} onClick={() => setSortDirection("desc")}>
                <ArrowUpWideNarrow />
              </Button>
            ) : (
              <Button size={"sm"} onClick={() => setSortDirection("asc")}>
                <ArrowDownWideNarrow />
              </Button>
            )}
            <TooltipBtn
              title={t("Add Administrator")}
              onClick={() => setOpen(true)}
            >
              <Plus />
              {t("Add Administrator")}
            </TooltipBtn>
          </div>
        }
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("Add admin")}</SheetTitle>
          </SheetHeader>
          <div className="p-3">
            <AutoForm
              submitText={t("Add admin")}
              onSubmit={onSubmit}
              form={form}
              fields={fields}
              showResetButton={false}
            />
          </div>
        </SheetContent>
      </Sheet>
      <Divider />
      <ReactPaginate
        breakLabel="..."
        onPageChange={(e) => {
          setPageNumber(e.selected + 1);
        }}
        pageRangeDisplayed={10}
        pageCount={Math.ceil(admins?.totalElements / 10) || 0}
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
        pageClassName="list-none"
        pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
        activeLinkClassName="bg-green-600 text-white rounded-full"
        renderOnZeroPageCount={null}
        forcePage={pageNumber > 0 ? pageNumber - 1 : 0}
      />
    </div>
  );
};

export default Administrators;
