"use client";

import { AutoForm } from "@/components/form/auto-form";
import {
  useCreateStudents,
  useDeleteStudents,
  useExcelExport,
  useStudents,
  useUpdateStudents,
} from "@/components/models/queries/students";
import MyTable, { IColumn } from "@/components/my-table";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  PenSquareIcon,
  Plus,
  Trash,
  User,
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
  const updating = useUpdateStudents();
  const deleteStudent = useDeleteStudents();
  const expertToExcel = useExcelExport();

  const [editingCategory, setEditingCategory] = useState<Record<
    string,
    any
  > | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      degree: "",
      name: "",
      surname: "",
      cardNumber: "",
      admissionTime: new Date(),
      graduationTime: new Date(),
      passportSeries: { label: "AA", value: "AA" },
      passportNumber: 0,
    },
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
          <div
            className={`w-7 h-6 rounded ${
              value ? "bg-green-500" : "bg-red-400"
            }`}
          />
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
              variant={"view"}
              size={"sm"}
              title={t("Edit category")}
              onClick={() => {
                setEditingCategory(record);
                form.reset({ name: record.name });
                setOpen(true);
              }}
            >
              <PenSquareIcon />
            </TooltipBtn>
            <TooltipBtn
              variant={"destructive"}
              size={"sm"}
              color={"red"}
              title={t("Delete category")}
              onClick={() => {
                deleteStudent.mutate(record.id, {
                  onSuccess: () =>
                    toast.success(t("Category deleted successfully")),
                  onError: () => toast.error(t("Error deleting category")),
                });
              }}
            >
              <Trash />
            </TooltipBtn>
          </div>
        ),
      },
    ],
    [deleteStudent, form, t]
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
        label: t("phoneNumber"),
        name: "phoneNumber",
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
    [t]
  );

  const onSubmit = (data: any) => {
    if (editingCategory) {
      updating.mutate(
        {
          id: editingCategory.id,
          ...data, // barcha fieldlarni yuboramiz
        },
        {
          onSuccess: () => {
            toast.success(t("Student updated successfully"));
            setOpen(false);
          },
        }
      );
    } else {
      createStudent.mutate(
        {
          ...data, // yangi student uchun barcha fieldlar
        },
        {
          onSuccess: () => {
            toast.success(t("Student created successfully"));
            setOpen(false);
            form.reset();
          },
        }
      );
    }
  };

  return (
    <div>
      <MyTable
        title={<h3 className={"text-2xl font-semibold py-5"}>{t("users")}</h3>}
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
          <div className={"flex justify-between items-center gap-2"}>
            <div>
              <ReactPaginate
                breakLabel="..."
                onPageChange={(e) => {
                  const newPageNum = e.selected + 1;
                  setPageNumber(newPageNum);
                }}
                pageRangeDisplayed={size}
                pageCount={Math.ceil(
                  (students?.data?.totalElements || 0) / size
                )}
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
    </div>
  );
};

export default Users;
