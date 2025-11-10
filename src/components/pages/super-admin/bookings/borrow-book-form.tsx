"use client";

import { api } from "@/components/models/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useBookingByStudentId } from "@/components/models/queries/booking";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BookItem {
  id: string;
  bookCopyId: string;
  title: string;
  author: string;
  inventoryNumber: string;
  epc: string;
  days: number;
}

export function BorrowBookForm() {
  const t = useTranslations();
  const form = useForm();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [studentCard, setStudentCard] = useState<string | null>(
    searchParams.get("studentCard") || null,
  );
  const [studentData, setStudentData] = useState<Record<string, any> | null>(
    null,
  );

  const [seriaCard, setSeriaCard] = useState<string | null>(
    searchParams.get("seriaCard") || null,
  );
  const [seriaData, setSeriaData] = useState<Record<string, any> | null>(null);

  const [bookCard, setBookCard] = useState<string | null>(
    searchParams.get("bookCard") || null,
  );
  const [bookData, setBookData] = useState<Record<string, any> | null>(null);

  const [selectedBooks, setSelectedBooks] = useState<BookItem[]>([]);
  const [ijaraMuddati, setIjaraMuddati] = useState<number>(
    searchParams.get("ijaraMuddati")
      ? Number(searchParams.get("ijaraMuddati"))
      : 7,
  );

  const debouncedStudentCard = useDebounce(studentCard, 600);
  const debouncedSeriaCard = useDebounce(seriaCard, 600);
  const debouncedBookCard = useDebounce(bookCard, 600);

  const [bookCopyType, setBookCopyType] = useState<"epc" | "inventoryNumber">(
    (searchParams.get("bookCopyType") as "epc" | "inventoryNumber") || "epc",
  );

  const [studentType, setStudentType] = useState<"cardNumber" | "seriaNumber">(
    (searchParams.get("studentType") as "cardNumber" | "seriaNumber") ||
      "cardNumber",
  );

  const isStudentSelected = Boolean(studentData || seriaData);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Update student parameters
    if (studentCard) {
      params.set("studentCard", studentCard.toString());
    } else {
      params.delete("studentCard");
    }

    if (seriaCard) {
      params.set("seriaCard", seriaCard.toString());
    } else {
      params.delete("seriaCard");
    }

    // Update book parameters
    if (bookCard) {
      params.set("bookCard", bookCard);
    } else {
      params.delete("bookCard");
    }

    // Update type parameters
    params.set("studentType", studentType);
    params.set("bookCopyType", bookCopyType);
    params.set("ijaraMuddati", ijaraMuddati.toString());

    // Update URL without page reload
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [
    studentCard,
    seriaCard,
    bookCard,
    studentType,
    bookCopyType,
    ijaraMuddati,
    router,
    searchParams,
  ]);

  const expirationDate = useMemo(
    () => dayjs(new Date()).add(ijaraMuddati, "day").format("DD-MM-YYYY"),
    [ijaraMuddati],
  );

  const [seeingStudent, setSeeingStudent] = useState<number | null>(null);

  const reservateBook = useMutation({
    mutationFn: async ({
      studentId,
      bookingDataDTO,
    }: {
      studentId: number;
      bookingDataDTO: Array<{ bookCopyId: string; days: number }>;
    }) => {
      const res = await api.post("/admin/booking/borrow", {
        studentId,
        bookingDataDTO,
      });
      return res.data;
    },
    onSuccess: () => toast.success(t("kitob muvaffaqiyatli ijaraga berildi")),
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (debouncedStudentCard && debouncedStudentCard.toString()) {
        try {
          const res = await api.get(
            `/admin/students/card/${debouncedStudentCard}`,
          );
          if (res.data?.data) {
            setStudentData(res.data.data);
          } else {
            setStudentData(null);
            toast.error("Bu ID bo'yicha talaba topilmadi");
          }
        } catch {
          setStudentData(null);
          toast.error("Bu ID bo'yicha talaba topilmadi");
        }
      } else {
        setStudentData(null);
      }
    };

    fetchStudent();
  }, [debouncedStudentCard]);

  useEffect(() => {
    const fetchSeriaNumber = async () => {
      // Faqat uzunligi 9 yoki 10 belgidan oshganda so'rov ketadi (masalan AD8769098)
      if (debouncedSeriaCard && debouncedSeriaCard.length >= 9) {
        try {
          const res = await api.get(
            `/admin/students/passport/${debouncedSeriaCard}`,
          );
          if (res.data?.data) {
            setSeriaData(res.data.data);
          } else {
            setSeriaData(null);
            toast.error("Bu passport bo'yicha talaba topilmadi");
          }
        } catch {
          setSeriaData(null);
          toast.error("Bu passport bo'yicha talaba topilmadi");
        }
      } else {
        // Agar hali to'liq yozilmagan bo'lsa — ma'lumotni tozalaymiz, lekin so'rov yubormaymiz
        setSeriaData(null);
      }
    };

    fetchSeriaNumber();
  }, [debouncedSeriaCard]);

  const studentBookings = useBookingByStudentId(seeingStudent);

  useEffect(() => {
    const fetchBook = async () => {
      if (debouncedBookCard && debouncedBookCard.toString()) {
        try {
          const res = await api.get(
            `/admin/book-copies/get?query=${debouncedBookCard}&field=${bookCopyType}`,
          );
          setBookData(res.data?.data);
        } catch {
          setBookData(null);
          toast.error("Kitob topilmadi");
        }
      } else {
        setBookData(null);
      }
    };

    fetchBook();
  }, [debouncedBookCard, bookCopyType]);

  const handleAddBook = () => {
    if (!bookData) {
      toast.error(t("Kitob tanlang"));
      return;
    }

    const newBook: BookItem = {
      id: `${Date.now()}-${Math.random()}`,
      bookCopyId: bookData.bookCopyId,
      title: bookData.title,
      author: bookData.author,
      inventoryNumber: bookData.inventoryNumber,
      epc: bookData.epc || "-",
      days: ijaraMuddati,
    };

    setSelectedBooks([...selectedBooks, newBook]);
    setBookCard(null);
    setBookData(null);
    toast.success(t("Kitob qo'shildi"));
  };

  const handleRemoveBook = (id: string) => {
    setSelectedBooks(selectedBooks.filter((book) => book.id !== id));
    toast.success(t("Kitob olib tashlandi"));
  };

  const handleClearAll = () => {
    setSelectedBooks([]);
    setStudentCard(null);
    setSeriaCard(null);
    setBookCard(null);
    setStudentData(null);
    setSeriaData(null);
    setBookData(null);
  };

  return (
    <div className="flex flex-col xl:flex-row w-full gap-3 h-full">
      <div className="flex flex-col w-full xl:w-1/2 gap-3 h-full">
        <div className="w-full">
          <Card>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Tabs
                  defaultValue={studentType}
                  onValueChange={(e: string) => setStudentType(e as any)}
                  aria-disabled={isStudentSelected}
                >
                  <TabsList>
                    <TabsTrigger
                      value="cardNumber"
                      disabled={isStudentSelected}
                      className="data-[state=active]:text-white data-[state=active]:bg-green-600"
                    >
                      {t("Card number")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="seriaNumber"
                      disabled={isStudentSelected}
                      className="data-[state=active]:text-white data-[state=active]:bg-green-600"
                    >
                      {t("Seria number")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={"cardNumber"}>
                    <Input
                      className={"w-full"}
                      value={studentCard ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setStudentCard(e.target.value)
                      }
                      placeholder={t("enter student card number")}
                      disabled={isStudentSelected}
                    />
                  </TabsContent>
                  <TabsContent value="seriaNumber">
                    <Input
                      className={"w-full"}
                      value={seriaCard ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSeriaCard(e.target.value)
                      }
                      placeholder={t("enter student seria number")}
                      disabled={isStudentSelected}
                    />
                  </TabsContent>
                </Tabs>

                <div className="w-full space-y-3">
                  {studentData && (
                    <Card className={"p-3"}>
                      <CardContent className={"p-1 space-y-2"}>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("fio")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.name} {studentData?.surname}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("faculty")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.faculty}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("degree")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.degree}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Admission Time")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.admissionTime}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Graduation Time")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.graduationTime}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Card number")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.cardNumber}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Phone number")}:</p>
                          <h1 className={"capitalize"}>
                            {studentData?.phoneNumber || (
                              <p className={"text-red-600 text-2xl"}>-</p>
                            )}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("talaba bronlari")}:</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-fit"
                                size="sm"
                                onClick={() =>
                                  setSeeingStudent(studentData?.id)
                                }
                              >
                                {t("see")}
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>
                                  {t("talaba bronlari")}
                                </DialogTitle>
                              </DialogHeader>

                              {studentBookings.isLoading && (
                                <p>{t("Yuklanmoqda...")}</p>
                              )}

                              {studentBookings.data?.data?.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                  {studentBookings.data.data.map(
                                    (booking: any) => (
                                      <Card key={booking.id} className="p-2">
                                        <CardContent className="space-y-1">
                                          <div className="flex justify-between">
                                            <span>{t("Kitob")}:</span>
                                            <b>{booking.title}</b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Muallif")}:</span>
                                            <b>{booking.author}</b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Berilgan sana")}:</span>
                                            <b>
                                              {dayjs(booking.givenAt).format(
                                                "DD-MM-YYYY",
                                              )}
                                            </b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Tugash muddati")}:</span>
                                            <b>
                                              {dayjs(booking.dueDate).format(
                                                "DD-MM-YYYY",
                                              )}
                                            </b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Status")}:</span>
                                            <b
                                              className={
                                                booking.status === "OVERDUE"
                                                  ? "text-red-600"
                                                  : "text-green-600"
                                              }
                                            >
                                              {booking.status}
                                            </b>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p>{t("talaba bronlari mavjud emas")}</p>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="w-full space-y-3">
                  {seriaData && (
                    <Card className={"p-3"}>
                      <CardContent className={"p-1 space-y-2"}>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("fio")}:</p>
                          <h1 className={"capitalize"}>
                            {seriaData?.name} {seriaData?.surname}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("faculty")}:</p>
                          <h1 className={"capitalize"}>{seriaData?.faculty}</h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("degree")}:</p>
                          <h1 className={"capitalize"}>{seriaData?.degree}</h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Admission Time")}:</p>
                          <h1 className={"capitalize"}>
                            {seriaData?.admissionTime}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Graduation Time")}:</p>
                          <h1 className={"capitalize"}>
                            {seriaData?.graduationTime}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Card number")}:</p>
                          <h1 className={"capitalize"}>
                            {seriaData?.cardNumber}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("Phone number")}:</p>
                          <h1 className={"capitalize"}>
                            {seriaData?.phoneNumber || (
                              <p className={"text-red-600 text-2xl"}>-</p>
                            )}
                          </h1>
                        </div>
                        <div className="flex justify-between">
                          <p className={"text-end"}>{t("talaba bronlari")}:</p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="w-fit"
                                size="sm"
                                onClick={() => setSeeingStudent(seriaData?.id)}
                              >
                                {t("see")}
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>
                                  {t("talaba bronlari")}
                                </DialogTitle>
                              </DialogHeader>

                              {studentBookings.isLoading && (
                                <p>{t("Yuklanmoqda...")}</p>
                              )}

                              {studentBookings.data?.data?.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                  {studentBookings.data.data.map(
                                    (booking: any) => (
                                      <Card key={booking.id} className="p-2">
                                        <CardContent className="space-y-1">
                                          <div className="flex justify-between">
                                            <span>{t("Kitob")}:</span>
                                            <b>{booking.title}</b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Muallif")}:</span>
                                            <b>{booking.author}</b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Berilgan sana")}:</span>
                                            <b>
                                              {dayjs(booking.givenAt).format(
                                                "DD-MM-YYYY",
                                              )}
                                            </b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Tugash muddati")}:</span>
                                            <b>
                                              {dayjs(booking.dueDate).format(
                                                "DD-MM-YYYY",
                                              )}
                                            </b>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t("Status")}:</span>
                                            <b
                                              className={
                                                booking.status === "OVERDUE"
                                                  ? "text-red-600"
                                                  : "text-green-600"
                                              }
                                            >
                                              {booking.status}
                                            </b>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <p>{t("talaba bronlari mavjud emas")}</p>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full">
          <Card className={"h-full"}>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Tabs
                  defaultValue={bookCopyType}
                  onValueChange={(e: string) => setBookCopyType(e as any)}
                >
                  <TabsList>
                    <TabsTrigger
                      value="epc"
                      className="data-[state=active]:text-white data-[state=active]:bg-green-600"
                    >
                      {t("Epc")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="inventoryNumber"
                      className="data-[state=active]:text-white data-[state=active]:bg-green-600"
                    >
                      {t("Inventory number")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={"epc"}>
                    <Input
                      value={bookCard ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBookCard(e.target.value as string)
                      }
                      placeholder={t("ijaraga berilayotgan kitobni kiriting")}
                      disabled={!isStudentSelected}
                    />
                  </TabsContent>
                  <TabsContent value="inventoryNumber">
                    <Input
                      value={bookCard ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setBookCard(e.target.value)
                      }
                      placeholder={t(
                        "ijaraga berilayotgan kitobning inventar raqamini kiriting",
                      )}
                      disabled={!isStudentSelected}
                    />
                  </TabsContent>
                </Tabs>

                {bookData && (
                  <Card className={"p-3"}>
                    <CardContent className={"p-1 space-y-2"}>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("Category")}:</p>
                        <h1 className={"capitalize"}>{bookData?.category}</h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("Author")}:</p>
                        <h1 className={"capitalize"}>{bookData?.author}</h1>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-end">{t("Title")}:</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[200px] truncate cursor-pointer capitalize text-end">
                                {bookData?.title || (
                                  <span className="text-red-500">--</span>
                                )}
                              </span>
                            </TooltipTrigger>

                            {bookData?.title && (
                              <TooltipContent className="max-w-sm whitespace-pre-wrap break-words text-[16px]">
                                {bookData.title}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("Inventory Number")}:</p>
                        <h1 className={"capitalize"}>
                          {bookData?.inventoryNumber}
                        </h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("Udc")}:</p>
                        <h1 className={"capitalize"}>{bookData?.udc}</h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("shelfLocation")}:</p>
                        <h1 className={"capitalize"}>
                          {bookData?.shelfLocation}
                        </h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("notes")}:</p>
                        <h1 className={"capitalize"}>{bookData?.notes}</h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("Epc")}:</p>
                        <h1 className={"capitalize"}>{bookData?.epc || "-"}</h1>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          className="cursor-pointer mt-2"
                          onClick={handleAddBook}
                          size="sm"
                        >
                          {t("Kitob qo'shish")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card className={"w-full xl:w-1/2"}>
        <CardContent>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {t("Tanlangan kitoblar")} ({selectedBooks.length})
            </h2>

            {selectedBooks.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedBooks.map((book, idx) => (
                  <Card key={book.id} className="p-3">
                    <CardContent className="p-1 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {idx + 1}. {book.title}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span>{t("Muallif")}:</span>
                            <span className="font-medium">{book.author}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{t("Inventory Number")}:</span>
                            <span className="font-medium">
                              {book.inventoryNumber}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{t("Ijara muddati")}:</span>
                            <span className="font-medium">{book.days} kun</span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveBook(book.id)}
                        >
                          {t("O'chirish")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {t("Kitob qo'shilmagan")}
              </p>
            )}

            {isStudentSelected && (
              <div className="space-y-4 border-t pt-4 mt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("Talaba")}</p>
                  <Input
                    defaultValue={`${(studentData || seriaData)?.name} ${(studentData || seriaData)?.surname}`}
                    disabled
                  />
                  <Input
                    defaultValue={(studentData || seriaData)?.faculty}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("ijara necha kun davom etadi")}
                  </p>
                  <Input
                    type="number"
                    min={1}
                    value={ijaraMuddati === 0 ? "" : ijaraMuddati}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const rawValue = e.target.value;

                      if (rawValue === "") {
                        setIjaraMuddati(0); // vaqtinchalik 0 saqlaymiz
                        return;
                      }

                      const value = Number(rawValue);
                      if (value >= 1) {
                        setIjaraMuddati(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "+") {
                        e.preventDefault();
                      }
                      if (
                        e.key === "0" &&
                        (e.target as HTMLInputElement).value === ""
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {t("ijaraga berish muddati")}
                  </p>
                  <Input value={expirationDate} disabled />
                </div>

                <div className="flex gap-2">
                  <Button
                    className={"cursor-pointer flex-1"}
                    variant={"secondary"}
                    onClick={handleClearAll}
                    disabled={selectedBooks.length === 0}
                  >
                    {t("Bekor qilish")}
                  </Button>
                  <Button
                    className={"cursor-pointer flex-1"}
                    variant={"default"}
                    onClick={async () => {
                      try {
                        if (selectedBooks.length === 0) {
                          toast.error(t("Kamida bitta kitob tanlang"));
                          return;
                        }

                        const activeStudentData = studentData || seriaData;
                        const bookingDataDTO = selectedBooks.map((book) => ({
                          bookCopyId: book.bookCopyId,
                          days: ijaraMuddati,
                        }));

                        reservateBook.mutate(
                          {
                            studentId: activeStudentData?.id,
                            bookingDataDTO,
                          },
                          {
                            onSuccess: () => {
                              window.location.href =
                                "/super-admin/bookings/active";
                            },
                            onError: () => {
                              toast.error(t("Xatolik yuz berdi"));
                            },
                          },
                        );
                      } catch (e) {
                        console.log(e);
                        toast.error(t("Xatolik yuz berdi"));
                      }
                    }}
                    disabled={selectedBooks.length === 0}
                  >
                    {t("Ijaraga berish")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
