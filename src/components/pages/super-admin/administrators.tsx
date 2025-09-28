"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm, FormField } from "@/components/form/auto-form";
import {
  useActivateAccount,
  useAdminDelete,
  useAdministrators,
  useCreateAdministrator,
} from "@/components/models/queries/admin";
import MyTable, { IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // shadcn input
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

export type FilterType = "all" | "active" | "inactive";

const Administrators = () => {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [pageNumber, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1
  );

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage);

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  const [activateOpen, setActivateOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const activateForm = useForm<{ email: string; code: string }>({
    defaultValues: { email: "", code: "" },
  });

  // const [pageNumber, setPageNumber] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { data: admins, isLoading } = useAdministrators({
    pageNumber,
    sortDirection,
  });
  const deleteAdmin = useAdminDelete();
  const createAdmin = useCreateAdministrator();
  const activate = useActivateAccount();

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
        width: 250,
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
        width: 400,
      },
      {
        key: "status",
        width: 300,
        title: t("status"),
        dataIndex: "isActive",
        render: (isActive: boolean) => (
          <div className="flex items-center justify-start">
            {isActive ? (
              <ShieldCheck className="text-green-600 w-5 h-5" />
            ) : (
              <ShieldX className="text-red-600 w-5 h-5" />
            )}
          </div>
        ),
      },
      {
        key: "actions",
        title: t("actions"),
        dataIndex: "actions",
        width: 150,
        render: (_: any, record: Record<string, any>) => (
          <div className="flex items-center gap-3">
            <TooltipBtn
              title={t("Account activity")}
              onClick={() => {
                setSelectedEmail(record.email); // tanlangan admin emailini saqlab olamiz
                activateForm.reset({ email: record.email, code: "" });
                setActivateOpen(true);
              }}
            >
              <Check />
            </TooltipBtn>

            <DeleteActionDialog
              onConfirm={() => {
                deleteAdmin.mutate(record.id, {
                  onSuccess: () =>
                    toast.success(t("Administrator deleted successfully")),
                  onError: () => toast.error(t("Error deleting admin")),
                });
              }}
              title={t("Delete")}
            />
          </div>
        ),
      },
    ],
    [activateForm, deleteAdmin, t]
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
          <h3 className={"text-2xl font-semibold"}>{t("Administrators")}</h3>
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
        footer={
          <div className={"flex items-center justify-between"}>
            <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
              <p className="text-sm whitespace-break-spaces">
                {t("Total Pages")}:{" "}
                <span className="text-green-600">{admins?.totalPages}</span>
              </p>
              <p className="text-sm whitespace-break-spaces">
                {t("Current Page")}:{" "}
                <span className="text-green-600">{admins?.currentPage}</span>
              </p>
              <p className="text-sm whitespace-break-spaces">
                {t("Total Elements")}:{" "}
                <span className="text-green-600">{admins?.totalElements}</span>
              </p>
            </div>
            <div>
              <ReactPaginate
                breakLabel="..."
                onPageChange={(e) => handlePageChange(e.selected + 1)}
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
                forcePage={pageNumber - 1}
              />
            </div>
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
      <Sheet open={activateOpen} onOpenChange={setActivateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t("Activate Administrator")}</SheetTitle>
          </SheetHeader>

          <form
            className="space-y-4 p-3"
            onSubmit={activateForm.handleSubmit((data) => {
              activate.mutate(data, {
                onSuccess: () => {
                  toast.success(t("Account successfully activated"));
                  setActivateOpen(false);
                },
                onError: (err: any) => {
                  toast.error(
                    err?.response?.data?.message || t("Activation failed")
                  );
                },
              });
            })}
          >
            <div>
              <Label className={"mb-3"}>{t("Email")}</Label>
              <Input
                {...activateForm.register("email", { required: true })}
                type="email"
                disabled={!!selectedEmail}
              />
            </div>
            <div>
              <Label className={"mb-3"}>{t("Confirmation Code")}</Label>
              <Input
                {...activateForm.register("code", { required: true })}
                type="text"
              />
            </div>
            <Button type="submit" className="w-full">
              {t("Activate")}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Administrators;
