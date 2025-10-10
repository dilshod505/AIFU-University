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

export function BorrowBookForm() {
  const t = useTranslations();
  const form = useForm();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [studentCard, setStudentCard] = useState<number | null>(
    searchParams.get("studentCard")
      ? Number(searchParams.get("studentCard"))
      : null,
  );
  const [studentData, setStudentData] = useState<Record<string, any> | null>(
    null,
  );

  const [seriaCard, setSeriaCard] = useState<number | null>(
    searchParams.get("seriaCard")
      ? Number(searchParams.get("seriaCard"))
      : null,
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
      cardNumber,
      id,
      days,
    }: {
      cardNumber: string;
      id: string;
      days: number;
    }) => {
      const res = await api.post("/admin/booking/borrow", {
        cardNumber: cardNumber.toString(),
        id,
        days,
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
      if (debouncedSeriaCard && debouncedSeriaCard.toString()) {
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
                        setStudentCard(Number(e.target.value))
                      }
                      placeholder={t("enter student card number")}
                    />
                  </TabsContent>
                  <TabsContent value="seriaNumber">
                    <Input
                      className={"w-full"}
                      value={seriaCard ?? ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setSeriaCard(Number(e.target.value))
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
                      placeholder={t("ijaraga  berilayotgan kitobni kiriting")}
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
                        <p className={"text-end"}>{t("Title")}:</p>
                        <h1 className={"capitalize"}>{bookData?.title}</h1>
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
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {bookData && studentData && (
        <Card className={"w-full xl:w-1/2"}>
          <CardContent>
            <div className="space-y-8">
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("student")}:</p>
                <Input
                  defaultValue={`${studentData?.name} ${studentData?.surname} (${studentData.cardNumber})`}
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("faculty")}:</p>
                <Input defaultValue={studentData?.faculty} disabled />
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
                    if (e.key === "-" || e.key === "+" || e.key === "0") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = Number(e.target.value);
                    if (value >= 1) {
                      setIjaraMuddati(value);
                    }
                  }}
                />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>
                  {t("ijaraga berish muddati")}:
                </p>
                <Input value={expirationDate} disabled />
              </div>
              <div className="flex justify-end items-center gap-3">
                <Button variant={"secondary"}>{t("Cancel")}</Button>
                <Button
                  variant={"default"}
                  onClick={async () => {
                    try {
                      reservateBook.mutate(
                        {
                          cardNumber: studentData?.cardNumber,
                          id: bookData?.bookCopyId,
                          days: ijaraMuddati,
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
                  {t("Ijaraga berish")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
