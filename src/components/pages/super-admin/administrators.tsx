"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm, type FormField } from "@/components/form/auto-form";
import {
  useActivateAccount,
  useAdminDelete,
  useAdministrators,
  useCreateAdministrator,
  useResendActivationCode,
} from "@/components/models/queries/admin";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

export type FilterType = "all" | "active" | "inactive";

const Administrators = () => {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [pageNumber, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1,
  );

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage);

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);

  const activateForm = useForm<{ email: string; code: string }>({
    defaultValues: { email: "", code: "" },
  });

  const [open, setOpen] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pendingAdminData, setPendingAdminData] = useState<any>(null);
  const [activationStep, setActivationStep] = useState<"form" | "code">("form");
  const { data: admins, isLoading } = useAdministrators({
    pageNumber,
    sortDirection,
  });
  const deleteAdmin = useAdminDelete();
  const createAdmin = useCreateAdministrator();
  const activate = useActivateAccount();
  const resendCode = useResendActivationCode();

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
    [t],
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
    [activateForm, deleteAdmin, t],
  );

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendCode = () => {
    if (selectedEmail) {
      resendCode.mutate(
        { email: selectedEmail },
        {
          onSuccess: () => {
            toast.success(t("Activation code sent to email"));
            setTimeLeft(300); // 5 minutes = 300 seconds
            setCanResend(false);
          },
          onError: () => {
            toast.error(t("Failed to resend code"));
          },
        },
      );
    }
  };

  const onSubmit = (data: any) => {
    createAdmin.mutate(data, {
      onSuccess: (res) => {
        toast.success(t("Activation code sent automatically to email"));
        setSelectedEmail(data.email);
        activateForm.reset({ email: data.email, code: "" });
        setPendingAdminData(data);
        setActivationStep("code");
        setTimeLeft(300); // 5 minutes = 300 seconds
        setCanResend(false);
      },
      onError: () => {
        toast.error(t("Failed to initiate admin creation"));
      },
    });
  };

  const handleSheetOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset when closing
      setActivationStep("form");
      form.reset();
      activateForm.reset();
      setPendingAdminData(null);
      setSelectedEmail(null);
      setTimeLeft(0);
      setCanResend(false);
    }
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
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent side={"center"}>
          <SheetHeader>
            <SheetTitle>
              {activationStep === "form"
                ? t("Add admin")
                : t("Activate Administrator")}
            </SheetTitle>
          </SheetHeader>

          <div className="p-3">
            {/* Progress indicator shown only during code verification */}
            {activationStep === "code" && (
              <div className="flex gap-2 mb-6">
                <div className="flex-1 h-1 rounded-full bg-gray-300" />
                <div className="flex-1 h-1 rounded-full bg-blue-600" />
              </div>
            )}

            {/* Step 1: Form with disabled inputs during code verification */}
            {activationStep === "form" && (
              <AutoForm
                submitText={t("Add admin")}
                onSubmit={onSubmit}
                form={form}
                fields={fields}
                showResetButton={false}
              />
            )}

            {/* Step 2: Code verification - form inputs disabled, code input shown below */}
            {activationStep === "code" && (
              <div className="space-y-4">
                {/* Disabled form fields for display */}
                <div className="space-y-3 opacity-50 pointer-events-none">
                  {pendingAdminData && (
                    <>
                      <div>
                        <Label className="text-sm font-medium">
                          {t("Name")}
                        </Label>
                        <Input
                          type="text"
                          value={pendingAdminData.name}
                          disabled
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          {t("Surname")}
                        </Label>
                        <Input
                          type="text"
                          value={pendingAdminData.surname}
                          disabled
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          {t("Email")}
                        </Label>
                        <Input
                          type="email"
                          value={pendingAdminData.email}
                          disabled
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          {t("Password")}
                        </Label>
                        <Input
                          type="password"
                          value={pendingAdminData.password}
                          disabled
                        />
                      </div>
                    </>
                  )}
                </div>
                <form
                  className="space-y-4 pt-6 border-t"
                  onSubmit={activateForm.handleSubmit((data) => {
                    activate.mutate(data, {
                      onSuccess: () => {
                        toast.success(t("Account successfully activated"));
                        handleSheetOpenChange(false);
                      },
                      onError: (err: any) => {
                        toast.error(
                          err?.response?.data?.message ||
                            t("Activation failed"),
                        );
                      },
                    });
                  })}
                >
                  <div>
                    <Label className="mb-3 block">
                      {t("Confirmation Code")}
                    </Label>
                    <Input
                      {...activateForm.register("code", { required: true })}
                      type="text"
                      placeholder={t("Enter 6-digit code")}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="mb-0">{t("Time remaining")}</Label>
                      <span className="text-lg font-semibold text-blue-600">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    {canResend && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          if (selectedEmail) {
                            resendCode.mutate(
                              { email: selectedEmail },
                              {
                                onSuccess: () => {
                                  toast.success(
                                    t("Activation code sent to email"),
                                  );
                                  setTimeLeft(300); // 5 minut qayta hisoblash
                                  setCanResend(false);
                                },
                                onError: () => {
                                  toast.error(t("Failed to resend code"));
                                },
                              },
                            );
                          }
                        }}
                        disabled={resendCode.isPending}
                      >
                        {resendCode.isPending
                          ? t("Sending...")
                          : t("Resend Code")}
                      </Button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={activate.isPending} // vaqt tugamagan bo‘lsa disabled
                  >
                    {activate.isPending
                      ? t("Verifying...")
                      : t("Faollashtirish")}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Administrators;
