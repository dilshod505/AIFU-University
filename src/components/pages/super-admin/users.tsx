"use client";

import DeleteActionDialog from "@/components/delete-action-dialog";
import { AutoForm } from "@/components/form/auto-form";
import {
  useCreateStudents,
  useDeleteStudents,
  useExcelExport,
  useGetById,
  useStudents,
  useUpdateStudents,
} from "@/components/models/queries/students";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  PenSquareIcon,
  Plus,
  User,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { RiFileExcel2Line } from "react-icons/ri";
import ReactPaginate from "react-paginate";
import { toast } from "sonner";

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
  const createStudent = useCreateStudents();
  const detail = useGetById();
  const updating = useUpdateStudents();
  const deleteStudent = useDeleteStudents();
  const expertToExcel = useExcelExport();

  const [editingCategory, setEditingCategory] = useState<Record<
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
          <div className="flex items-center justify-center">
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
                    console.log("🔍 Student detail:", res.data);
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
                detail.mutate(record.id, {
                  onSuccess: (res) => {
                    form.reset({
                      name: res.data.name,
                      surname: res.data.surname,
                      faculty: res.data.faculty,
                      degree: res.data.degree,
                      passportSeries: {
                        label: res.data.passportSeries,
                        value: res.data.passportSeries,
                      },
                      passportNumber: res.data.passportNumber,
                      phoneNumber: res.data.phoneNumber,
                      cardNumber: res.data.cardNumber,
                      admissionTime: new Date(res.data.admissionTime, 0),
                      graduationTime: new Date(res.data.graduationTime, 0),
                    });
                    setEditingCategory(res.data);
                    setOpen(true);
                  },
                });
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>

            <DeleteActionDialog
              title={t("Delete")}
              onConfirm={() => {
                deleteStudent.mutate(record.id, {
                  onSuccess: () =>
                    toast.success(t("Category deleted successfully")),
                  onError: () => toast.error(t("Error deleting category")),
                });
              }}
            />
          </div>
        ),
      },
    ],
    [deleteStudent, detail, form, t],
  );

  const fields = useMemo<any[]>(
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
        type: "select",
        options: [
          { label: "AA", value: "AA" },
          { label: "AB", value: "AB" },
          { label: "AC", value: "AC" },
          { label: "AD", value: "AD" },
          { label: "AE", value: "AE" },
          { label: "FA", value: "FA" },
          { label: "FB", value: "FB" },
          { label: "FC", value: "FC" },
        ],
        required: true,
        maxLength: 2,
        sm: 12,
        md: 6,
      },
      {
        label: t("passportNumber"),
        name: "passportNumber",
        type: "number",
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

  const onSubmit = (data: any) => {
    const payload = {
      name: String(data.name || ""),
      surname: String(data.surname || ""),
      phoneNumber: String(data.phoneNumber || ""),
      faculty: String(data.faculty || ""),
      degree: String(data.degree || ""),
      passportSeries:
        data.passportSeries?.value || String(data.passportSeries || ""),
      passportNumber: String(data.passportNumber || ""),
      cardNumber: String(data.cardNumber || ""),
      admissionTime: new Date(data.admissionTime).getFullYear(),
      graduationTime: new Date(data.graduationTime).getFullYear(),
    };

    console.log("📤 Yuborilayotgan payload:", payload);

    if (editingCategory) {
      updating.mutate(
        { id: editingCategory.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("Student updated successfully"));
            setOpen(false);
          },
          onError: (err) => {
            console.error("❌ Update error:", err);
            toast.error(t("Error updating student"));
          },
        },
      );
    } else {
      createStudent.mutate(
        { payload },
        {
          onSuccess: () => {
            toast.success(t("Student created successfully"));
            setOpen(false);
            form.reset();
          },
          onError: (err) => {
            console.error("❌ Create error:", err);
            toast.error(t("Error creating student"));
          },
        },
      );
    }
  };

  return (
    <TooltipProvider>
      <div>
        <MyTable
          title={
            <h3 className={"text-2xl font-semibold py-5"}>{t("users")}</h3>
          }
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
              <TooltipBtn
                title={t("Export to Excel")}
                onClick={() => {
                  expertToExcel.mutate({
                    filter,
                    pageNumber,
                    size,
                    sortDirection,
                  });
                }}
              >
                <RiFileExcel2Line />
              </TooltipBtn>
              <TooltipBtn
                variant={"default"}
                title={t("Add Student")}
                onClick={() => {
                  setEditingCategory(null);
                  form.reset({ name: "" });
                  setOpen(true);
                }}
              >
                <Plus />
                {t("Add Student")}
              </TooltipBtn>
            </div>
          }
          footer={
            <div
              className={
                "flex flex-col lg:flex-row justify-between items-center gap-2"
              }
            >
              <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
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
                  onPageChange={(e) => {
                    const newPageNum = e.selected + 1;
                    setPageNumber(newPageNum);
                  }}
                  pageRangeDisplayed={3} // bu yerda nechta sahifa bir paytda ko‘rinsinligini belgilang
                  pageCount={Math.ceil((students?.totalElements || 1) / size)} // ✅ tuzatildi
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
                  pageClassName="list-none"
                  pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                  activeLinkClassName="bg-green-600 text-white rounded-full"
                />
              </div>
            </div>
          }
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent className="bg-white dark:bg-background hide-scroll w-fit">
            <SheetHeader>
              <SheetTitle>
                {editingCategory ? t("Edit Category") : t("Add Category")}
              </SheetTitle>
            </SheetHeader>
            <AutoForm
              className="bg-transparent mt-5 mx-5 border-none p-0"
              submitText={
                editingCategory ? t("Edit Category") : t("Add Category")
              }
              onSubmit={onSubmit}
              form={form}
              fields={fields}
              showResetButton={false}
            />
          </SheetContent>
        </Sheet>
        <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
          <SheetContent className="bg-white dark:bg-background hide-scroll w-fit">
            <SheetHeader>
              <SheetTitle>{t("Student Details")}</SheetTitle>
            </SheetHeader>
            {viewingDetail && (
              <div className="mt-5 mx-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("firstName")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("lastName")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.surname}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Faculty")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.faculty}
                    </div>
                  </div>
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("passportSeries")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.passportSeries}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("passportNumber")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.passportNumber}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("phoneNumber")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.phoneNumber}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Card number")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.cardNumber}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Admission Time")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.admissionTime}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Graduation Time")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      {viewingDetail.graduationTime}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("status")}
                    </label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded ${viewingDetail.status ? "bg-green-500" : "bg-red-400"}`}
                      />
                      {viewingDetail.status ? t("Active") : t("Inactive")}
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

export default Users;
