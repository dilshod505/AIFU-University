"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { api } from "@/components/models/axios";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
  const expirationDate = useMemo(
    () => dayjs(new Date()).add(ijaraMuddati, "day").format("DD-MM-YYYY"),
    [ijaraMuddati],
  );

  const [seeingStudent, setSeeingStudent] = useState<number | null>(null);
  const reservationsOfStudent = useQuery({
    queryKey: ["reservations", seeingStudent],
    queryFn: async () => {
      const res = await api.get<Record<string, any>>(
        `/admin/booking?field=studentId&query=${seeingStudent}`,
      );
      return res.data;
    },
    enabled: !!seeingStudent,
    select: (data: Record<string, any>) => data?.data,
  });

  const reservateBook = useMutation({
    mutationFn: async ({
      cardNumber,
      epc,
      days,
    }: {
      cardNumber: string;
      epc: string;
      days: number;
    }) => {
      const res = await api.post("/admin/booking/borrow", {
        cardNumber: cardNumber.toString(),
        epc,
        days,
      });
      return res.data;
    },
    onSuccess: () => toast.success(t("kitob muvaffaqiyatli ijaraga berildi")),
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (studentCard && studentCard.toString().length === 10) {
        const res = await api.get(`/admin/students/card/${studentCard}`);
        setStudentData(res.data?.data);
      }
    };

    fetchStudent();
  }, [studentCard]);

  useEffect(() => {
    const fetchBook = async () => {
      if (bookCard && bookCard.toString().length >= 8) {
        const res = await api.get(`/admin/book-copies/epc/${bookCard}`);
        setBookData(res.data?.data);
      }
    };

    fetchBook();
  }, [bookCard]);

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
                        <p className={"text-end"}>{t("Card number")}:</p>
                        <h1 className={"capitalize"}>
                          {studentData?.cardNumber}
                        </h1>
                      </div>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("talaba bronlari")}:</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-fit"
                              size={"sm"}
                              onClick={() =>
                                setSeeingStudent(studentData?.cardNumber)
                              }
                            >
                              {t("see")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>{t("talaba bronlari")}</DialogTitle>
                            </DialogHeader>
                            {reservationsOfStudent.data?.length > 0 ? (
                              <div></div>
                            ) : (
                              <div>{t("talaba bronlari mavjud emas")}</div>
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
                <Input
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setBookCard(e.target.value as string)
                  }
                  placeholder={t("ijaraga  berilayotgan kitobni kiriting")}
                />
                {bookData && (
                  <Card className={"p-3"}>
                    <CardContent className={"p-1 space-y-2"}>
                      <div className="flex justify-between">
                        <p className={"text-end"}>{t("Inventory Number")}:</p>
                        <h1 className={"capitalize"}>
                          {bookData?.inventoryNumber}
                        </h1>
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
                <p className={"p-0 m-0 w-full"}>{t("Inventory Number")}:</p>
                <Input defaultValue={bookData.inventoryNumber} disabled />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>{t("shelfLocation")}:</p>
                <Input defaultValue={bookData.shelfLocation} disabled />
              </div>
              <div className="flex justify-between items-center gap-3">
                <p className={"p-0 m-0 w-full"}>
                  {t("ijara necha kun davom etadi")}:
                </p>
                <Input
                  defaultValue={ijaraMuddati}
                  type={"number"}
                  min={1}
                  accept={"number"}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (e.target.value) {
                      setIjaraMuddati(Number(e.target.value));
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
                      reservateBook.mutate({
                        cardNumber: studentData?.cardNumber,
                        epc: bookData?.inventoryNumber,
                        days: ijaraMuddati,
                      });
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
