"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm } from "@/components/form/auto-form";
import { api, makeFullUrl } from "@/components/models/axios";
import {
  useCreateStudents,
  useDeactivateGraduates,
  useDeleteStudents,
  useExcelExport,
  useExcelExportShablon,
  useGetById,
  useImportStudents,
  useStudents,
  useUpdateStudents,
} from "@/components/models/queries/students";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import useLayoutStore from "@/store/layout-store";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Eye,
  GraduationCap,
  ImportIcon,
  PenSquareIcon,
  Plus,
  Search,
  Settings2,
  User,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";
import { RiFileExcel2Line } from "react-icons/ri";

export type FilterType = "all" | "active" | "inactive";

const Students = () => {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [pageNumber, setPageNumber] = useState<number>(
    Number(searchPagination.get("page")) || 1,
  );

  const handlePageChange = (page: number) => {
    setPageNumber(page);
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  const [filter, setFilter] = useState<FilterType>("all");
  const [size, setSize] = useState<10 | 25 | 50 | 100>(10);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchField, setSearchField] = useState<
    "id" | "cardNumber" | "fullName"
  >("fullName");

  const [firstQuery, setFirstQuery] = useState("");
  const [secondQuery, setSecondQuery] = useState("");

  const { user } = useLayoutStore();
  const role = user?.role?.toString().toLowerCase().replace("_", "-");

  const fullNameQuery = `${firstQuery}~${secondQuery}`;
  const { data: students } = useStudents({
    filter,
    pageNumber,
    size,
    sortDirection,
    ...(searchField === "fullName" && (firstQuery || secondQuery)
      ? { field: "fullName", query: fullNameQuery }
      : searchValue
        ? { field: searchField, query: searchValue }
        : {}),
  });

  useEffect(() => {
    setPageNumber(1);
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [searchValue, firstQuery, secondQuery, filter, searchField, router]);
  const createStudent = useCreateStudents();
  const detail = useGetById();
  const updating = useUpdateStudents();
  const deleteStudent = useDeleteStudents();
  const expertToExcel = useExcelExport();
  const exportToExcelShablon = useExcelExportShablon();

  const isSubmitting = createStudent.isPending || updating.isPending;

  const downloadFile = async (url: string, filename: string) => {
    try {
      const fullUrl = makeFullUrl(url)!;

      const res = await api.get(fullUrl, {
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Yuklab olishda xatolik:", err);
    }
  };

  const importStudents = useImportStudents();
  const [importResult, setImportResult] = useState<{
    successCount?: number;
    errorCount?: number;
    downloadReportUrl?: string;
  } | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importStudents.mutate(file, {
        onSuccess: (res) => {
          toast.success(res.message || "Import completed", {
            style: {
              maxWidth: "600px",
              width: "100%",
            },
          });

          setImportResult({
            successCount: res.data?.successCount || res.successCount,
            errorCount: res.data?.errorCount || res.errorCount,
            downloadReportUrl:
              makeFullUrl(
                res.data?.downloadReportUrl || res.downloadReportUrl,
              ) || "",
          });
        },
        onError: () => {
          toast.error("Xatolik: import amalga oshmadi", {
            style: {
              maxWidth: "600px",
              width: "100%",
            },
          });
        },
      });
    }
  };
  const deactivateGraduates = useDeactivateGraduates();
  const [deactivateResult, setDeactivateResult] = useState<{
    successCount?: number;
    debtorCount?: number;
    notFoundCount?: number;
    jobId?: string;
    downloadDebtorsReportUrl?: string;
    downloadNotFoundReportUrl?: string;
  } | null>(null);

  const handleDeactivate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      deactivateGraduates.mutate(file, {
        onSuccess: (res) => {
          toast.success(res.message || "Deaktivatsiya jarayoni boshlandi", {
            style: {
              maxWidth: "600px",
              width: "100%",
            },
          });

          setDeactivateResult({
            successCount: res.data?.successCount || res.successCount,
            debtorCount: res.data?.debtorCount || res.debtorCount,
            notFoundCount: res.data?.notFoundCount || res.notFoundCount,
            jobId: res.data?.jobId || res.jobId,
            downloadDebtorsReportUrl:
              res.data?.downloadDebtorsReportUrl ||
              `/api/super-admin/students/lifecycle/report/debtors/${res.data?.jobId || res.jobId}`,
            downloadNotFoundReportUrl:
              res.data?.downloadNotFoundReportUrl ||
              `/api/super-admin/students/lifecycle/report/not-found/${res.data?.jobId || res.jobId}`,
          });
        },
        onError: () => toast.error("❌ Deaktivatsiya xatolik bilan tugadi"),
      });
    }
  };

  const [editingStudent, setEditingStudent] = useState<Record<
    string,
    any
  > | null>(null);
  const [viewingDetail, setViewingDetail] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const form = useForm();

  const editingStudentData = useQuery({
    queryKey: ["editing-student", editingStudent?.id],
    queryFn: async () => {
      const res = await api.get(`/admin/students/${editingStudent?.id}`);
      return res.data;
    },
    enabled: !!editingStudent,
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
        key: "degree",
        title: t("degree"),
        dataIndex: "degree",
        render: (value: string) => (
          <div className="flex items-center gap-2">
            {value === "Bakalavr" ? (
              <GraduationCap className="w-5 h-5 text-blue-600" />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
            <span>{value}</span>
          </div>
        ),
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
          <div className="flex items-center justify-start">
            {value ? (
              <UserRoundCheck className="text-green-600 w-5 h-5" />
            ) : (
              <UserRoundX className="text-red-500 w-5 h-5" />
            )}
          </div>
        ),
      },
      {
        key: "actions",
        dataIndex: "actions",
        width: 200,
        title: t("actions"),
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            <TooltipBtn
              variant={"ampersand"}
              size={"sm"}
              title={t("Detail")}
              onClick={() => {
                detail.mutate(record.id, {
                  onSuccess: (res) => {
                    setViewingDetail(res.data);
                    setDetailOpen(true);
                  },
                });
              }}
            >
              <Eye />
            </TooltipBtn>

            <TooltipBtn
              variant={"view"}
              size={"sm"}
              title={t("Edit category")}
              onClick={() => {
                setEditingStudent(record);
                setOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            {role === "super-admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TooltipBtn title={t("Type")}>
                    <EllipsisVertical />
                  </TooltipBtn>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(
                        `/super-admin/users/students/${record.id}?type=active`,
                      );
                    }}
                  >
                    {t("Active bronlar")}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      router.push(
                        `/super-admin/users/students/${record.id}?type=archive`,
                      );
                    }}
                  >
                    {t("Archive bronlar")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {role === "admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TooltipBtn title={t("Type")}>
                    <EllipsisVertical />
                  </TooltipBtn>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/admin/users/${record.id}?type=active`);
                    }}
                  >
                    {t("Active bronlar")}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      router.push(`/admin/users/${record.id}?type=archive`);
                    }}
                  >
                    {t("Archive bronlar")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {role === "super-admin" && (
              <DeleteActionDialog
                title={t("Delete")}
                onConfirm={() => {
                  deleteStudent.mutate(record.id, {
                    onSuccess: () =>
                      toast.success(t("Student deleted successfully")),
                    onError: () => toast.error(t("Error deleting student")),
                  });
                }}
              />
            )}
          </div>
        ),
      },
    ],
    [deleteStudent, detail, role, router, t],
  );

  const allFields = useMemo<any[]>(
    () => [
      {
        label: t("firstName"),
        name: "name",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("lastName"),
        name: "surname",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Faculty"),
        name: "faculty",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Degree"),
        name: "degree",
        type: "select",
        options: [
          { label: "Bakalavr", value: "Bakalavr" },
          { label: "Magistr", value: "Magistr" },
          { label: "PhD", value: "PhD" },
        ],
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("passportSeries"),
        name: "passportSeries",
        type: "text",
        required: true,
        maxLength: 2,
        sm: 12,
        md: 6,
      },
      {
        label: t("passportNumber"),
        name: "passportNumber",
        type: "text",
        required: true,
        maxLength: 7,
        sm: 12,
        md: 6,
      },
      {
        label: t("phoneNumber"),
        name: "phoneNumber",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Card number"),
        name: "cardNumber",
        type: "text",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Admission Time"),
        name: "admissionTime",
        type: "date",
        required: true,
        sm: 12,
        md: 6,
      },
      {
        label: t("Graduation Time"),
        name: "graduationTime",
        type: "date",
        required: true,
        sm: 12,
        md: 6,
      },
    ],
    [t],
  );

  const fields = allFields;

  const onSubmit = (data: any) => {
    const payload = {
      name: String(data.name || ""),
      surname: String(data.surname || ""),
      phoneNumber: String(data.phoneNumber || ""),
      faculty: String(data.faculty || ""),
      degree: String(data.degree || ""),
      passportSeries:
        data.passportSeries?.value || String(data.passportSeries || ""),
      passportNumber: String(data.passportNumber),
      cardNumber: String(data.cardNumber || ""),
      admissionTime: new Date(data.admissionTime).getFullYear(),
      graduationTime: new Date(data.graduationTime).getFullYear(),
    };

    if (editingStudent) {
      updating.mutate(
        { id: editingStudent.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("Student updated successfully"), {
              style: {
                maxWidth: "600px",
                width: "100%",
              },
            });
            setOpen(false);
          },
          onError: (err) => {
            console.error("❌ Update error:", err);
            toast.error(t("Error updating student"), {
              style: {
                maxWidth: "600px",
                width: "100%",
              },
            });
          },
        },
      );
    } else {
      createStudent.mutate(
        { payload },
        {
          onSuccess: () => {
            (toast.success(t("Student created successfully")),
              {
                style: {
                  maxWidth: "600px",
                  width: "100%",
                },
              });
            setOpen(false);
            form.reset();
          },
          onError: (err) => {
            console.error("❌ Create error:", err);
            (toast.error(t("Error creating student")),
              {
                style: {
                  maxWidth: "600px",
                  width: "100%",
                },
              });
          },
        },
      );
    }
  };

  useEffect(() => {
    if (editingStudent) {
      form.reset({
        ...editingStudentData.data?.data,
      });
    }
  }, [
    editingStudent,
    editingStudentData.data?.data,
    editingStudentData.isLoading,
    form,
  ]);

  return (
    <TooltipProvider>
      <div>
        <MyTable
          className={"py-5"}
          title={<h3 className={"text-2xl font-semibold"}>{t("Students")}</h3>}
          columns={columns}
          dataSource={students?.data || []}
          pagination={false}
          size={"large"}
          striped
          header={
            <div className="flex gap-4">
              <div className="flex items-center gap-3">
                {/* Search Bar Container */}
                <div className="flex-1 rounded-full shadow-lg p-1 flex items-center gap-2 bg-white dark:bg-gray-900">
                  {/* Filter Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TooltipBtn
                        className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors dark:hover:bg-gray-800"
                        title={t("Filter")}
                      >
                        <Settings2 size={18} />
                      </TooltipBtn>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setSearchField("fullName");
                          setSearchValue("");
                          setFirstQuery("");
                          setSecondQuery("");
                        }}
                        className={
                          searchField === "fullName"
                            ? "bg-blue-50 dark:bg-blue-900"
                            : ""
                        }
                      >
                        {t("name and lastName search")}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setSearchField("cardNumber");
                          setSearchValue("");
                          setFirstQuery("");
                          setSecondQuery("");
                        }}
                        className={
                          searchField === "cardNumber"
                            ? "bg-blue-50 dark:bg-blue-900"
                            : ""
                        }
                      >
                        {t("Card number search")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Input Fields */}
                  <div className="flex-1 flex items-center gap-3 px-2">
                    {searchField === "fullName" ? (
                      <>
                        <input
                          type="text"
                          placeholder={t("Name")}
                          value={firstQuery}
                          onChange={(e) => setFirstQuery(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        />
                        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
                        <input
                          type="text"
                          placeholder={t("Last Name")}
                          value={secondQuery}
                          onChange={(e) => setSecondQuery(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        placeholder={t("Search card number")}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-90 flex-1 bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                      />
                    )}
                  </div>

                  {/* Search Button */}
                  <TooltipBtn
                    className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                    title={t("Search")}
                  >
                    <Search size={18} />
                  </TooltipBtn>
                </div>

                {/* Sort + Add */}
                <div className="flex gap-2">
                  {sortDirection === "asc" ? (
                    <TooltipBtn
                      size="sm"
                      onClick={() => setSortDirection("desc")}
                    >
                      <ArrowUpWideNarrow />
                    </TooltipBtn>
                  ) : (
                    <TooltipBtn
                      size="sm"
                      onClick={() => setSortDirection("asc")}
                    >
                      <ArrowDownWideNarrow />
                    </TooltipBtn>
                  )}

                  <Tabs
                    value={filter}
                    onValueChange={(a: string) => setFilter(a as any)}
                  >
                    <TabsList className="flex gap-2">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                      >
                        {t("All")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                      >
                        {t("Active")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="inactive"
                        className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
                      >
                        {t("Inactive")}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <TooltipBtn title={t("Select type excel download")}>
                        <RiFileExcel2Line />
                        {t("Add Student")}
                      </TooltipBtn>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => expertToExcel.mutate({})}
                      >
                        {t("Export Students")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => exportToExcelShablon.mutate({})}
                      >
                        {t("Export Template")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <TooltipBtn title={t("Import Students")}>
                    <label>
                      <ImportIcon />
                      <input
                        type="file"
                        accept=".xlsx"
                        hidden
                        onChange={handleImport}
                      />
                    </label>
                  </TooltipBtn>

                  {role === "super-admin" && (
                    <TooltipBtn
                      title={t("Deactivate Graduates")}
                      variant={"destructive"}
                    >
                      <label>
                        <ImportIcon />
                        <input
                          type="file"
                          accept=".xlsx"
                          hidden
                          onChange={handleDeactivate}
                        />
                      </label>
                    </TooltipBtn>
                  )}

                  <TooltipBtn
                    size="sm"
                    title={t("Add Student")}
                    onClick={() => {
                      setEditingStudent(null);
                      form.reset({ name: "" });
                      setOpen(true);
                    }}
                  >
                    <Plus /> {t("Add Student")}
                  </TooltipBtn>
                </div>
              </div>

              {/* Filter Tabs */}
            </div>
          }
          footer={
            <div
              className={
                "flex flex-wrap flex-col lg:flex-row justify-center lg:justify-between items-center gap-4"
              }
            >
              {importResult && (
                <div className="space-y-2 border p-3 rounded bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Muvaffaqiyatli qo'shilganlar:{" "}
                    <span className="font-semibold">
                      {importResult.successCount ?? 0}
                    </span>
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Qo'shilmaganlar:{" "}
                    <span className="font-semibold">
                      {importResult.errorCount ?? 0}
                    </span>
                  </p>

                  {importResult.errorCount && importResult.errorCount > 0 && (
                    <Button
                      onClick={() =>
                        downloadFile(
                          importResult.downloadReportUrl!,
                          "import-errors.xlsx",
                        )
                      }
                      className="bg-red-600 text-white mt-2"
                      size="sm"
                    >
                      {t("Qo'shilmagan talabalar hisobotini yuklab olish")}
                    </Button>
                  )}
                </div>
              )}
              {deactivateResult && (
                <div className="border p-2 rounded bg-gray-50 dark:bg-gray-900">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Muvaffaqiyatli deaktivatsiya qilinganlar:{" "}
                    <span className="font-semibold">
                      {deactivateResult.successCount ?? 0}
                    </span>
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Qarzdorlar:{" "}
                    <span className="font-semibold">
                      {deactivateResult.debtorCount ?? 0}
                    </span>
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Topilmagan talabalar:{" "}
                    <span className="font-semibold">
                      {deactivateResult.notFoundCount ?? 0}
                    </span>
                  </p>

                  <div className="flex gap-3 mt-2">
                    {deactivateResult.debtorCount &&
                      deactivateResult.debtorCount > 0 && (
                        <Button
                          onClick={() =>
                            downloadFile(
                              deactivateResult.downloadDebtorsReportUrl!,
                              "qarzdor-talabalar.xlsx",
                            )
                          }
                          className="bg-yellow-600 text-white mt-2"
                          size="sm"
                        >
                          {t("Qarzdor talabalar hisobotini yuklab olish")}
                        </Button>
                      )}

                    {deactivateResult.notFoundCount &&
                      deactivateResult.notFoundCount > 0 && (
                        <Button
                          onClick={() =>
                            downloadFile(
                              deactivateResult.downloadNotFoundReportUrl!,
                              "topilmagan-talabalar.xlsx",
                            )
                          }
                          className="bg-gray-600 text-white mt-2"
                          size="sm"
                        >
                          {t("Topilmagan talabalar hisobotini yuklab olish")}
                        </Button>
                      )}
                  </div>
                </div>
              )}
              <div className="font-bold text-[20px] flex flex-col lg:flex-row gap-5">
                <p className="text-sm">
                  {t("Total Pages")}:{" "}
                  <span className="text-green-600">{students?.totalPages}</span>
                </p>
                <p className="text-sm">
                  {t("Current Page")}:{" "}
                  <span className="text-green-600">
                    {students?.currentPage}
                  </span>
                </p>
                <p className="text-sm">
                  {t("Total Elements")}:{" "}
                  <span className="text-green-600">
                    {students?.totalElements}
                  </span>
                </p>
              </div>
              <div>
                <ReactPaginate
                  breakLabel="..."
                  onPageChange={(e) => handlePageChange(e.selected + 1)}
                  pageRangeDisplayed={3}
                  pageCount={Math.ceil((students?.totalElements || 1) / size)}
                  previousLabel={
                    <Button
                      className={
                        "bg-white text-black dark:bg-gray-800 dark:text-white"
                      }
                    >
                      <ChevronLeft />
                      {t("Return")}
                    </Button>
                  }
                  nextLabel={
                    <Button
                      className={
                        "bg-white text-black dark:bg-gray-800 dark:text-white"
                      }
                    >
                      {t("Next")} <ChevronRight />
                    </Button>
                  }
                  className={"flex justify-center gap-2 items-center my-5"}
                  renderOnZeroPageCount={null}
                  forcePage={pageNumber - 1}
                  pageClassName="list-none"
                  pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                  activeLinkClassName="bg-green-600 text-white rounded-full"
                />
              </div>
            </div>
          }
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side={"center"} className={"w-[900px]"}>
            <SheetHeader>
              <SheetTitle>
                {editingStudent ? t("Edit users") : t("Add student")}
              </SheetTitle>
            </SheetHeader>
            <AutoForm
              className="bg-transparent mt-5 mx-5 border-none p-0"
              submitText={editingStudent ? t("Edit users") : t("Add")}
              onSubmit={onSubmit}
              form={form}
              showResetButton={false}
              fields={
                editingStudent
                  ? fields.filter(
                      (f) =>
                        !["passportSeries", "passportNumber"].includes(f.name),
                    )
                  : fields
              }
              loading={isSubmitting}
            />
          </SheetContent>
        </Sheet>
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent
            className="bg-white dark:bg-background hide-scroll w-fit"
            side={"center"}
          >
            <SheetHeader>
              <SheetTitle>{t("Student Details")}</SheetTitle>
            </SheetHeader>
            {viewingDetail && (
              <div className="mt-5 mx-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("firstName")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.name}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("lastName")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.surname}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Faculty")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.faculty}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Degree")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                      {viewingDetail.degree === "Bakalavr" ? (
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                      {viewingDetail.degree}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Card number")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.cardNumber}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Phone number")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.phoneNumber
                        ? viewingDetail.phoneNumber
                        : "-"}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Admission Time")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.admissionTime}
                    </div>
                  </div>
                  <div className="space-y-2.5 h-full">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Graduation Time")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.graduationTime}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
};

export default Students;
