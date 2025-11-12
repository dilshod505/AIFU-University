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
import { X } from "lucide-react";
import TooltipBtn from "@/components/tooltip-btn";

interface BookingItem {
  bookCopyId: string;
  days: number;
  title: string;
  author: string;
  inventoryNumber: string;
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

  const debouncedStudentCard = useDebounce(studentCard, 600);
  const debouncedSeriaCard = useDebounce(seriaCard, 600);
  const debouncedBookCard = useDebounce(bookCard, 600);

  const [ijaraMuddati, setIjaraMuddati] = useState<number>(
    searchParams.get("ijaraMuddati")
      ? Number(searchParams.get("ijaraMuddati"))
      : 7,
  );
  const [bookCopyType, setBookCopyType] = useState<"epc" | "inventoryNumber">(
    (searchParams.get("bookCopyType") as "epc" | "inventoryNumber") || "epc",
  );

  const [studentType, setStudentType] = useState<"cardNumber" | "seriaNumber">(
    (searchParams.get("studentType") as "cardNumber" | "seriaNumber") ||
      "cardNumber",
  );

  const [bookedItems, setBookedItems] = useState<BookingItem[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

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

    if (bookCard) {
      params.set("bookCard", bookCard);
    } else {
      params.delete("bookCard");
    }

    params.set("studentType", studentType);
    params.set("bookCopyType", bookCopyType);
    params.set("ijaraMuddati", ijaraMuddati.toString());

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
      bookingData,
    }: {
      studentId: string;
      bookingData: Array<{ bookCopyId: string; days: number }>;
    }) => {
      const res = await api.post("/admin/booking/borrow", {
        studentId,
        bookingDataDTO: bookingData,
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
        setSeriaData(null);
      }
    };

    fetchSeriaNumber();
  }, [debouncedSeriaCard]);

  const studentBookings = useBookingByStudentId(seeingStudent);
  const [isBookLoading, setIsBookLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (debouncedBookCard && debouncedBookCard.toString()) {
        setIsBookLoading(true);
        try {
          const res = await api.get(
            `/admin/book-copies/get?query=${debouncedBookCard}&field=${bookCopyType}`,
          );
          setBookData(res.data?.data);
        } catch {
          setBookData(null);
          toast.error("Kitob topilmadi");
        } finally {
          setIsBookLoading(false);
        }
      } else {
        setBookData(null);
      }
    };

    fetchBook();
  }, [debouncedBookCard, bookCopyType]);

  const addBookToList = () => {
    if (!bookData) return;

    const newItem: BookingItem = {
      bookCopyId: bookData.bookCopyId,
      days: ijaraMuddati,
      title: bookData.title,
      author: bookData.author,
      inventoryNumber: bookData.inventoryNumber,
    };

    // Check if book is already added
    if (bookedItems.some((item) => item.bookCopyId === newItem.bookCopyId)) {
      toast.error(t("Bu kitob allaqachon qo'shilgan"));
      return;
    }

    setBookedItems([...bookedItems, newItem]);
    setBookCard(null);
    setBookData(null);
    toast.success(t("Kitob ro'yxatga qo'shildi"));
  };

  const removeBookFromList = (bookCopyId: string) => {
    setBookedItems(
      bookedItems.filter((item) => item.bookCopyId !== bookCopyId),
    );
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
                >
                  <TabsList>
                    <TabsTrigger
                      value="cardNumber"
                      className="data-[state=active]:text-white data-[state=active]:bg-green-600"
                    >
                      {t("Card number")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="seriaNumber"
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
                    />
                  </TabsContent>
                </Tabs>

                {isBookLoading ? (
                  <Card className="p-3">
                    <CardContent className="p-2 flex justify-center items-center">
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <div className="animate-spin h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full"></div>
                        <p>{t("Yuklanmoqda...")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  bookData && (
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
                          <h1 className={"capitalize"}>
                            {bookData?.epc || "-"}
                          </h1>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {bookData && (studentData || seriaData) && (
        <Card className={"w-full xl:w-1/2"}>
          <CardContent>
            <div className="space-y-8">
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("student")}:</p>
                <Input
                  defaultValue={`${(studentData || seriaData)?.name} ${(studentData || seriaData)?.surname} (${(studentData || seriaData)?.cardNumber})`}
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("faculty")}:</p>
                <Input
                  defaultValue={(studentData || seriaData)?.faculty}
                  disabled
                />
              </div>

              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("Author")}:</p>
                <Input defaultValue={bookData.author || "-"} disabled />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("Title")}:</p>
                <Input defaultValue={bookData.title || "-"} disabled />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("Inventory Number")}:</p>
                <Input defaultValue={bookData.inventoryNumber} disabled />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("shelfLocation")}:</p>
                <Input defaultValue={bookData.shelfLocation} disabled />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("Epc")}:</p>
                <Input defaultValue={bookData.epc || "-"} disabled />
              </div>

              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>
                  {t("ijara necha kun davom etadi")}:
                </p>
                <Input
                  defaultValue={ijaraMuddati}
                  type="number"
                  min={1}
                  onKeyDown={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (e.key === "-" || e.key === "+") e.preventDefault();
                    if (e.key === "0" && target.value === "")
                      e.preventDefault();
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 1) setIjaraMuddati(value);
                  }}
                />
              </div>

              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>
                  {t("ijaraga berish muddati")}:
                </p>
                <Input value={expirationDate} disabled />
              </div>

              {/* faqat qo'shish tugmasi */}
              <TooltipBtn onClick={addBookToList} className={"w-full"}>
                {t("Kitobni ro'yxatga qo'shish")}
              </TooltipBtn>
            </div>
          </CardContent>
        </Card>
      )}
      {bookedItems.length > 0 && (
        <Card className="w-[800px]">
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold">
                {t("Qo'shilgan kitoblar")}: ({bookedItems.length})
              </h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {bookedItems.map((item) => (
                  <Card key={item.bookCopyId} className="p-2">
                    <CardContent className="p-2 flex justify-between items-center gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-600">{item.author}</p>
                        <p className="text-xs text-gray-500">
                          {item.inventoryNumber} • {item.days} {t("kun")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBookFromList(item.bookCopyId)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() =>
                    (window.location.href = "/super-admin/bookings/active")
                  }
                >
                  {t("Cancel")}
                </Button>

                <Button
                  variant="default"
                  disabled={bookedItems.length === 0}
                  onClick={async () => {
                    try {
                      const activeStudentData = studentData || seriaData;
                      reservateBook.mutate(
                        {
                          studentId: activeStudentData?.id,
                          bookingData: bookedItems.map((item) => ({
                            bookCopyId: item.bookCopyId,
                            days: item.days,
                          })),
                        },
                        {
                          onSuccess: () => {
                            window.location.href =
                              "/super-admin/bookings/active";
                          },
                          onError: () => {
                            t("Error");
                          },
                        },
                      );
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                >
                  {t("Ijaraga berish")} ({bookedItems.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
