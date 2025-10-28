"use client";

import { api } from "@/components/models/axios";
import MyTable, { type IColumn } from "@/components/my-table";
import TooltipBtn from "@/components/tooltip-btn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useHistory } from "@/hooks/use-bookings";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Archive,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  RefreshCw,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function HistoryPage() {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  const [pageNum, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1,
  );

  const handlePageChange = (newPage: number) => {
    setPageNum(newPage);

    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`);
  };

  const t = useTranslations();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [pageNum, setPageNum] = useState<number>(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [searchField, setSearchField] = useState<
    "userID" | "cardNumber" | "inventoryNumber"
  >("cardNumber");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearching(searchQuery.length > 0);
      setPageNum(1); // qidiruv o‘zgarsa 1-sahifaga qaytadi
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);
  const { data: history, isLoading } = useHistory({
    searchField,
    searchQuery: debouncedSearchQuery,
    pageNumber: pageNum,
    pageSize: 10,
    sortDirection,
  });

  const detail = useMutation({
    mutationFn: async (id: number | string) => {
      const res = await api.get(`/admin/history/${id}`);
      return res.data; // <-- bu juda muhim
    },
  });

  const exportExcel = useMutation({
    mutationFn: async () => {
      const res = await api.get("/admin/backup/history", {
        responseType: "blob", // Excel blob fayl sifatida keladi
      });

      // Faylni browserda yuklab olish
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "history.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });

  const columns = useMemo<IColumn[]>(
    () => [
      {
        title: "#",
        key: "index",
        dataIndex: "index",
        width: 50,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: t("Name"),
        key: "name",
        dataIndex: "name",
      },
      {
        title: t("Surname"),
        key: "surname",
        dataIndex: "surname",
      },
      {
        title: t("Author"),
        key: "author",
        dataIndex: "author",
      },
      {
        title: t("book title"),
        key: "bookTitle",
        dataIndex: "bookTitle",
      },
      {
        title: t("Inventory number"),
        key: "inventoryNumber",
        dataIndex: "inventoryNumber",
      },
      {
        title: t("Given At"),
        key: "givenAt",
        dataIndex: "givenAt",
        render: (givenAt: string) => dayjs(givenAt).format("DD.MM.YYYY"),
      },
      {
        title: t("Due Date"),
        key: "dueDate",
        dataIndex: "dueDate",
        render: (dueDate: string) => dayjs(dueDate).format("DD.MM.YYYY"),
      },
      {
        title: t("Returned At"),
        key: "returnedAt",
        dataIndex: "returnedAt",
        render: (returnedAt: string) => dayjs(returnedAt).format("DD.MM.YYYY"),
      },
      {
        title: t("action"),
        key: "actions",
        dataIndex: "actions",
        render: (_: any, record: any) => (
          <TooltipBtn
            variant="ampersand"
            title={t("See")}
            onClick={async () => {
              const res = await detail.mutateAsync(record.id);
              setSelectedDetail(res.data);
              setOpenDetail(true);
            }}
          >
            <Eye />
          </TooltipBtn>
        ),
      },
    ],
    [detail, t],
  );

  return (
    <div className="p-2">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      ) : history?.totalElements === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {isSearching
              ? t("Qidiruv natijasi topilmadi")
              : t("Arxivda yozuvlar mavjud emas")}
            <p
              className={"text-green-600 mt-3"}
              onClick={() => window.location.reload()}
            >
              <TooltipBtn title={t("Refresh")}>
                {t("Sahifani yangilash")}
                <RefreshCw />
              </TooltipBtn>
            </p>
          </p>
          <p className="text-sm text-muted-foreground">
            {!isSearching &&
              t("Kitoblar qaytarilgandan so'ng bu yerda ko'rinadi")}
          </p>
        </div>
      ) : (
        <div>
          <MyTable
            columns={columns}
            dataSource={history?.list || []}
            pagination={false}
            title={
              <div>
                <h1 className="text-3xl font-bold">
                  {t("arxivlangan ijaralar")}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t("arxivlangan ijaralar royxati")} (
                  {history?.totalElements || 0})
                </p>
              </div>
            }
            header={
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {/* Search Bar Container */}
                  <div className="flex-1 rounded-full shadow-lg p-1 flex items-center gap-2">
                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <TooltipBtn
                          className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"
                          title={t("Filter")}
                        >
                          <Settings2 size={18} />
                        </TooltipBtn>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {/*<DropdownMenuItem*/}
                        {/*  onClick={() => setSearchField("userID")}*/}
                        {/*  className={*/}
                        {/*    searchField === "userID" ? "bg-blue-50" : ""*/}
                        {/*  }*/}
                        {/*>*/}
                        {/*  {t("User ID bo'yicha qidirish")}*/}
                        {/*</DropdownMenuItem>*/}
                        <DropdownMenuItem
                          onClick={() => setSearchField("cardNumber")}
                          className={
                            searchField === "cardNumber" ? "bg-blue-50" : ""
                          }
                        >
                          {t("Card Number bo'yicha qidirish")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setSearchField("inventoryNumber")}
                          className={
                            searchField === "inventoryNumber"
                              ? "bg-blue-50"
                              : ""
                          }
                        >
                          {t("Inventory Number bo'yicha qidirish")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Search Inputs */}
                    <div className="flex-1 flex items-center gap-3 px-2">
                      <input
                        type="text"
                        placeholder={
                          searchField === "userID"
                            ? t("Foydalanuvchi ID kiriting")
                            : searchField === "cardNumber"
                              ? t("Karta raqami")
                              : t("Inventar raqami")
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm dark:text-white"
                      />
                    </div>

                    {/* Search Button */}
                    <TooltipBtn
                      className="flex-shrink-0 mr-1 p-2.5 rounded-full transition-colors"
                      title={t("Search")}
                    >
                      <Search size={18} />
                    </TooltipBtn>
                  </div>

                  {/* Sort & Export */}
                  <div className="flex gap-2 items-center">
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

                    <TooltipBtn
                      title={t("Excelga yuklab olish")}
                      onClick={() => exportExcel.mutate()}
                      disabled={exportExcel.isPending}
                    >
                      <FileDown className="w-4 h-4" />
                      {exportExcel.isPending ? t("Yuklanmoqda...") : ""}
                    </TooltipBtn>
                  </div>
                </div>
              </div>
            }
            footer={
              <div
                className={
                  "flex flex-wrap justify-center items-center lg:justify-between"
                }
              >
                <div className="font-bold text-[20px] space-y-1 flex items-center gap-5">
                  <p className="text-sm whitespace-break-spaces">
                    {t("Total Pages")}:{" "}
                    <span className="text-green-600">
                      {history?.totalPages}
                    </span>
                  </p>
                  <p className="text-sm whitespace-break-spaces">
                    {t("Current Page")}:{" "}
                    <span className="text-green-600">
                      {history?.currentPage}
                    </span>
                  </p>
                  <p className="text-sm whitespace-break-spaces">
                    {t("Total Elements")}:{" "}
                    <span className="text-green-600">
                      {history?.totalElements}
                    </span>
                  </p>
                </div>
                <ReactPaginate
                  breakLabel="..."
                  onPageChange={(e) => handlePageChange(e.selected + 1)}
                  forcePage={pageNum - 1}
                  pageRangeDisplayed={3}
                  marginPagesDisplayed={1}
                  pageCount={history?.totalPages || 0}
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
                  pageClassName="list-none"
                  pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
                  activeLinkClassName="bg-green-600 text-white rounded-full"
                />
              </div>
            }
          />
        </div>
      )}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              {t("Ijara tafsilotlarini ko‘rish")}
            </DialogTitle>
          </DialogHeader>

          {detail.isPending ? (
            <div className="text-center py-6">
              <div className="animate-spin h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p>{t("Yuklanmoqda...")}</p>
            </div>
          ) : selectedDetail ? (
            <div className="mt-2 space-y-3 text-sm">
              {/* Student Info */}
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Talaba")}:
                </span>
                <span className="font-medium">
                  {selectedDetail.student.name} {selectedDetail.student.surname}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Fakultet")}:
                </span>
                <span>{selectedDetail.student.faculty}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Daraja")}:
                </span>
                <span>{selectedDetail.student.degree}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Karta raqami")}:
                </span>
                <span>{selectedDetail.student.cardNumber}</span>
              </div>

              <hr className="my-2" />

              {/* Book Info */}
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Kitob sarlavhasi")}:
                </span>
                <span>{selectedDetail.book.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Muallif")}:
                </span>
                <span>{selectedDetail.book.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Inventar raqami")}:
                </span>
                <span>{selectedDetail.book.inventoryNumber}</span>
              </div>

              <hr className="my-2" />

              {/* Dates */}
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Berilgan sana")}:
                </span>
                <span>
                  {dayjs(selectedDetail.givenAt).format("DD.MM.YYYY")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Qaytarish muddati")}:
                </span>
                <span>
                  {dayjs(selectedDetail.dueDate).format("DD.MM.YYYY")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Qaytarilgan sana")}:
                </span>
                <span>
                  {dayjs(selectedDetail.returnedAt).format("DD.MM.YYYY")}
                </span>
              </div>

              <hr className="my-2" />

              {/* Responsible Persons */}
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">
                  {t("Berilgan tomonidan")}:
                </span>
                <span className={"text-green-600"}>
                  {selectedDetail.issuedBy.name}{" "}
                  {selectedDetail.issuedBy.surname}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">
                  {t("Qabul qilgan tomonidan")}:
                </span>
                <div className="flex flex-col items-end">
                  <span className={"text-green-600"}>
                    {selectedDetail.returnedBy.name}{" "}
                    {selectedDetail.returnedBy.surname}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              {t("Ma'lumot topilmadi")}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
