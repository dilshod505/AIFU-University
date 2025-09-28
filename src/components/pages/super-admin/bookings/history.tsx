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
  FileDown,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import ReactPaginate from "react-paginate";

export default function HistoryPage() {
  const router = useRouter();
  const searchPagination = useSearchParams();

  const [pageNum, setPageNum] = useState<number>(
    Number(searchPagination.get("page")) || 1
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
  >("userID");

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
    ],
    [t]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setPageNum(1);
  };

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
              <div
                className={"flex justify-between items-center gap-2 flex-wrap"}
              >
                <div className="relative max-w-[250px]">
                  <Select
                    value={searchField}
                    onValueChange={(
                      e: "userID" | "cardNumber" | "inventoryNumber"
                    ) => setSearchField(e)}
                    defaultValue="userID"
                  >
                    <SelectTrigger value={searchField}>
                      {searchField === "userID"
                        ? t("user ID")
                        : searchField === "cardNumber"
                          ? t("Card number")
                          : t("Inventory number")}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="userID">{t("id")}</SelectItem>
                      <SelectItem value="cardNumber">
                        {t("Card number")}
                      </SelectItem>
                      <SelectItem value="inventoryNumber">
                        {t("Inventory number")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative max-w-[250px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={16} />
                  </div>
                  <Input
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-10"
                    placeholder={t("Search")}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
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
                  title={t("Excelga yuklab olish")}
                  onClick={() => exportExcel.mutate()}
                  disabled={exportExcel.isPending}
                >
                  <FileDown className="w-4 h-4" />
                  {exportExcel.isPending ? t("Yuklanmoqda...") : ""}
                </TooltipBtn>
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
    </div>
  );
}
