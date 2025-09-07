"use client";

import { api } from "@/components/models/axios";
import MyTable, { IColumn } from "@/components/my-table";
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
  Search,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import ReactPaginate from "react-paginate";

export default function HistoryPage() {
  const t = useTranslations();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageNum, setPageNum] = useState<number>(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);
  const [searchField, setSearchField] = useState<string>("userID");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { data: history, isLoading } = useHistory({
    searchField,
    searchQuery,
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
        title: t("Book title"),
        key: "bookTitle",
        dataIndex: "bookTitle",
      },
      {
        title: t("Inventory number"),
        key: "inventoryNumber",
        dataIndex: "inventoryNumber",
      },
      {
        title: t("Given at"),
        key: "givenAt",
        dataIndex: "givenAt",
        render: (givenAt: string) => dayjs(givenAt).format("DD.MM.YYYY"),
      },
      {
        title: t("Due date"),
        key: "dueDate",
        dataIndex: "dueDate",
        render: (dueDate: string) => dayjs(dueDate).format("DD.MM.YYYY"),
      },
      {
        title: t("Returned at"),
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("arxivlangan ijaralar")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("arxivlangan ijaralar royxati")} ({history?.length || 0})
          </p>
        </div>

        {/* ✅ Excelga export tugmasi */}
        <Button
          variant="outline"
          onClick={() => exportExcel.mutate()}
          disabled={exportExcel.isPending}
        >
          <FileDown className="w-4 h-4 mr-2" />
          {exportExcel.isPending
            ? t("Yuklanmoqda...")
            : t("Excelga yuklab olish")}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loading")}</p>
        </div>
      ) : history?.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {isSearching
              ? t("Qidiruv natijasi topilmadi")
              : t("Arxivda yozuvlar mavjud emas")}
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
            dataSource={history || []}
            header={
              <div
                className={"flex justify-between items-center gap-2 flex-wrap"}
              >
                <div className="relative max-w-[250px]">
                  <Select
                    value={searchField}
                    onValueChange={(e: string) => setSearchField(searchField)}
                    defaultValue="userID"
                  >
                    <SelectTrigger value={"userID"}>
                      {t("user ID")}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="userID">{t("user ID")}</SelectItem>
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
              </div>
            }
          />
          <div>
            <ReactPaginate
              breakLabel="..."
              onPageChange={(e) => {
                const newPageNum = e.selected + 1;
                setPageNum(newPageNum);
              }}
              pageRangeDisplayed={10}
              pageCount={Math.ceil((history?.data?.totalElements || 0) / 10)}
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
              forcePage={pageNum - 1}
              pageClassName="list-none"
              pageLinkClassName="px-3 py-1 rounded-full border cursor-pointer block"
              activeLinkClassName="bg-green-600 text-white rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
