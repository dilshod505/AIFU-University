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
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useTranslations } from "next-intl";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useBookingByStudentId } from "@/components/models/queries/booking";

export function BorrowBookForm() {
  const t = useTranslations();
  const form = useForm();
  const [studentCard, setStudentCard] = useState<number | null>(null);
  const [studentData, setStudentData] = useState<Record<string, any> | null>(
    null,
  );
  const [bookCard, setBookCard] = useState<string | null>(null);
  const [bookData, setBookData] = useState<Record<string, any> | null>(null);
  const [ijaraMuddati, setIjaraMuddati] = useState<number>(7);
  const [bookCopyType, setBookCopyType] = useState<"epc" | "inventoryNumber">(
    "epc",
  );

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
      if (studentCard && studentCard.toString().length === 10) {
        try {
          const res = await api.get(`/admin/students/card/${studentCard}`);
          setStudentData(res.data?.data);
        } catch (error) {
          setStudentData(null);
        }
      } else {
        // Agar 10 ta raqam bo‘lmasa student ma'lumotini o‘chiramiz
        setStudentData(null);
      }
    };

    fetchStudent();
  }, [studentCard]);

  const studentBookings = useBookingByStudentId(seeingStudent);

  useEffect(() => {
    const fetchBook = async () => {
      if (bookCard && bookCard.toString().length >= 8) {
        const res = await api.get(
          `/admin/book-copies/get?query=${bookCard}&field=${bookCopyType}`,
        );
        setBookData(res.data?.data);
      }
    };

    fetchBook();
  }, [bookCard, bookCopyType]);

  return (
    <div className="flex flex-col xl:flex-row w-full gap-3 h-full">
      <div className="flex flex-col w-full xl:w-1/2 gap-3 h-full">
        <div className="w-full">
          <Card>
            <CardContent>
              <div className="w-full space-y-3">
                <Input
                  className={"w-full"}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStudentCard(Number(e.target.value))
                  }
                  placeholder={t("enter student card number")}
                />
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
                        <h1 className={"capitalize"}>{studentData?.faculty}</h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("degree")}:</p>
                        <h1 className={"capitalize"}>{studentData?.degree}</h1>
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
                              onClick={() => setSeeingStudent(studentData?.id)}
                            >
                              {t("see")}
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>{t("talaba bronlari")}</DialogTitle>
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
                        setBookCard(e.target.value.toUpperCase())
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
                    if (e.key === "-" || e.key === "+") {
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
                            window.location.reload();
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
