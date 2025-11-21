"use client";

import React, { useState } from "react";

import { NumberTicker } from "@/components/magicui/number-ticker"; // Magic UI import
import {
  useAdminbActivity,
  useAverageUsage,
  useBookCopiesCount,
  useBookingOverdue,
  useBookingsCount,
  useBookingsDiagram,
  useBookingsPerDay,
  useBookingsPerMonth,
  useBookingsToday,
  useBookingsTodayOverdue,
  useBooksCount,
  useBooksTop,
  useStudentsCount,
  useStudentsTop,
} from "@/components/models/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApexOptions } from "apexcharts";
import {
  BookCopy,
  BookOpen,
  CalendarDays,
  CalendarIcon,
  Eye,
  GraduationCap,
  SquareCheckBig,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import Chart from "react-apexcharts";
import useLayoutStore from "@/store/layout-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useGetById } from "@/components/models/queries/students";
import TooltipBtn from "@/components/tooltip-btn";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/components/models/axios";

const Dashboard = () => {
  const t = useTranslations();

  const [viewingDetail, setViewingDetail] = useState<Record<
    string,
    any
  > | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);

  const { user } = useLayoutStore();
  const role = user?.role?.toString().toLowerCase().replace("_", "-");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const month = (selectedDate?.getMonth() ?? new Date().getMonth()) + 1;
  const year = selectedDate?.getFullYear() ?? new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState<number>(2025);

  const detailStudent = useMutation({
    mutationFn: async (id: string | any) => {
      const res = await api.get(`/admin/students/${id}`);
      return res.data;
    },
    onSuccess: (res) => {
      setViewingDetail(res.data);
      setDetailOpen(true);
    },
  });

  const studentsTop = useStudentsTop();
  const studentsCount = useStudentsCount();
  const booksTop = useBooksTop();
  const bookingToday = useBookingsToday();
  const bookingsTodayOverdue = useBookingsTodayOverdue();
  const bookingPerMonth = useBookingsPerMonth(selectedYear);
  const bookingPerDay = useBookingsPerDay(year, month);
  const bookingOverdue = useBookingOverdue();
  const bookingDiagram = useBookingsDiagram();
  const bookingCount = useBookingsCount();
  const booksCount = useBooksCount();
  const bookCopiesCount = useBookCopiesCount();
  const averageStatic = useAverageUsage();

  const data = bookingPerDay.data?.data || [];
  const categories = data.map((d: any) => d.date.slice(-2)); // faqat kun qismi
  const taken = data.map((d: any) => d.taken);
  const returned = data.map((d: any) => d.returned);
  const returnedLate = data.map((d: any) => d.returnedLate);

  const [period, setPeriod] = useState<"current-month" | "last-month">(
    "current-month",
  );

  // 🔍 query chaqiruvi
  const adminsActivity = useAdminbActivity(period);

  // -------------------- Monthly (kunlik) --------------------
  const perDayData = bookingPerDay.data?.data || [];
  const dayCategories = perDayData.map((item: any) =>
    new Date(item.date).getDate(),
  );
  const takenPerDay = perDayData.map((item: any) => item.taken);
  const returnedPerDay = perDayData.map((item: any) => item.returned);
  const returnedLatePerDay = perDayData.map((item: any) => item.returnedLate);

  const perDayOptions: ApexOptions = {
    chart: { id: "perDay", toolbar: { show: false } },
    xaxis: { categories, title: { text: "Kunlar" } },
    legend: { position: "bottom" },
  };

  const perDaySeries = [
    { name: t("Taken"), data: taken },
    { name: t("Returned"), data: returned },
    { name: t("Returned Late"), data: returnedLate },
  ];

  const yearlyData = bookingPerMonth.data?.data || [];
  const monthNames = useMemo(
    () => [
      t("January").slice(0, 3),
      t("February").slice(0, 3),
      t("March").slice(0, 3),
      t("April").slice(0, 3),
      t("May").slice(0, 3),
      t("June").slice(0, 3),
      t("July").slice(0, 3),
      t("August").slice(0, 3),
      t("September").slice(0, 3),
      t("October").slice(0, 3),
      t("November").slice(0, 3),
      t("December").slice(0, 3),
    ],
    [t],
  );
  const yearlyCategories = yearlyData.map(
    (item: any) => monthNames[item.month - 1],
  );
  const takenYearly = yearlyData.map((item: any) => item.taken);
  const returnedYearly = yearlyData.map((item: any) => item.returned);
  const returnedLateYearly = yearlyData.map((item: any) => item.returnedLate);

  const yearlyOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: true } },
    xaxis: {
      categories: yearlyCategories,
      title: { text: t("Months of Year") },
    },
    tooltip: { shared: true, intersect: false },
  };

  const yearlySeries = useMemo(
    () => [
      { name: t("Taken"), data: takenYearly },
      { name: t("Returned"), data: returnedYearly },
      { name: t("Returned Late"), data: returnedLateYearly },
    ],
    [takenYearly, returnedYearly, returnedLateYearly, t],
  );

  return (
    <>
      <div className="p-6 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{t("Dashboard")}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            title={t("Total Students")}
            value={studentsCount.isLoading ? null : studentsCount.data?.data}
            subtitle={t("Registered library members")}
            icon={<Users />}
            loading={studentsCount.isLoading}
            valueClassName="text-blue-600 dark:text-blue-400"
            iconBg="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title={t("Total Books")}
            value={booksCount.isLoading ? null : booksCount.data?.data}
            subtitle={t("Books in collection")}
            icon={<BookCopy />}
            loading={booksCount.isLoading}
            valueClassName="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            title={t("Book Copies")}
            subtitle={t("Physical book copies")}
            value={
              bookCopiesCount.isLoading ? null : bookCopiesCount.data?.data
            }
            icon={<BookOpen />}
            loading={bookCopiesCount.isLoading}
            valueClassName="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
          />
          <StatCard
            title={t("Total Bookings")}
            subtitle={t("All time bookings")}
            value={bookingCount.isLoading ? null : bookingCount.data?.data}
            icon={<CalendarDays />}
            loading={bookingCount.isLoading}
            valueClassName="text-green-600 dark:text-green-400"
            iconBg="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
          />
          <StatCard
            title={t("Overdue Total")}
            subtitle={t("All overdue bookings")}
            value={
              bookingDiagram.isLoading ? null : bookingDiagram?.data?.overdue
            }
            icon={<SquareCheckBig />}
            loading={bookingDiagram.isLoading}
            valueClassName="text-red-600 dark:text-red-400"
            iconBg="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
          />
          <StatCard
            title={t("Average Usage")}
            subtitle={t("Average books per student")}
            value={
              averageStatic.isLoading
                ? null
                : averageStatic.data?.data?.averageDays
            }
            icon={<BookOpen />}
            loading={averageStatic.isLoading}
            valueClassName="text-yellow-600 dark:text-yellow-400"
            iconBg="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 mb-6 space-y-5 space-x-2">
          <Panel
            title={
              <span className="text-blue-700 dark:text-blue-400">
                {t("Bookings Per Day")}
              </span>
            }
            className="bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
          >
            {bookingPerDay.isLoading ? (
              <Skeleton className="w-full h-48" />
            ) : (
              <Chart
                type="donut"
                height="300"
                options={{
                  labels: [t("valid"), t("overdue")],
                  legend: { position: "bottom" },
                  colors: ["#22c55e", "#ef4444"], // ✅ yashil, qizil
                }}
                series={[
                  bookingDiagram.data?.valid || 0,
                  bookingDiagram.data?.overdue || 0,
                ]}
              />
            )}
          </Panel>

          <Panel
            title={
              <span className="text-green-700 dark:text-green-400">
                {t("Today's Bookings")}
              </span>
            }
            className="bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800"
          >
            {bookingToday.isLoading ? (
              <Skeleton className="w-full h-48" />
            ) : bookingToday.data?.data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <SquareCheckBig className="w-10 h-10 mb-2" />
                <p className="font-bold text-lg">{t("0 bookings today")}</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3 p-2 hide-scroll mt-[-50px]">
                {bookingToday.data.data.map((b: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-green-100 dark:border-green-800"
                  >
                    <p className="font-bold text-[18px] text-gray-900 dark:text-gray-100 mb-1">
                      {b?.studentFullName}
                    </p>
                    <p className="text-[15px] text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{t("Book title")}:</span>{" "}
                      {b.title}
                    </p>
                    <p className="text-[15px] text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{t("Author")}:</span>{" "}
                      {b.author}
                    </p>
                    <p className="text-[15px] text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{t("Admin")}:</span>{" "}
                      {b.adminFullName}
                    </p>
                    <p className="text-[14px] font-semibold text-green-600 mt-1 flex items-center justify-between">
                      <span>{t("Due Date")}:</span>
                      <span>
                        {new Date(b.dueDate).toISOString().split("T")[0]}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title={
              <span className="text-red-700 dark:text-red-400">
                {t("Overdue Today Bookings")}
              </span>
            }
            className="bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800"
          >
            {bookingsTodayOverdue?.isLoading ? (
              <Skeleton className="w-full h-48" />
            ) : bookingsTodayOverdue?.data?.data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <SquareCheckBig className="w-10 h-10 mb-2" />
                <p className="font-bold text-lg">
                  {t("0 overdue bookings today")}
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3 p-2 hide-scroll mt-[-50px]">
                {bookingsTodayOverdue.data.data.map((b: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-red-100 dark:border-red-800"
                  >
                    <p className="font-bold text-[18px] text-gray-900 dark:text-gray-100 mb-1">
                      {b?.studentFullName}
                    </p>
                    <p className="text-[15px] text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{t("Book title")}:</span>{" "}
                      {b.title}
                    </p>
                    <p className="text-[15px] text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{t("Author")}:</span>{" "}
                      {b.author}
                    </p>
                    <p className="text-[15px] text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{t("Admin name")}:</span>{" "}
                      {b.adminFullName}
                    </p>
                    <p className="text-[14px] font-semibold text-red-600 mt-2">
                      {new Date(b.dueDate).toISOString().split("T")[0]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <div className="lg:col-span-1 xl:col-span-4">
            <Panel
              title={
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700 dark:text-indigo-400">
                    {t("Monthly Booking Statistics")}
                  </span>

                  {/* Oy / Yil tanlash tugmasi */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        {selectedDate
                          ? format(selectedDate, "MMMM yyyy")
                          : t("Select month")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        hideWeekdays
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              }
              className="bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800"
            >
              <div className="h-64">
                {bookingPerDay.isLoading ? (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    {t("Loading chart")}...
                  </div>
                ) : (
                  <Chart
                    options={perDayOptions}
                    series={perDaySeries}
                    type="bar"
                    height="250"
                  />
                )}
              </div>
            </Panel>
            <div className={"mt-3"}>
              <Panel
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {t("Yearly Booking Statistics")}
                    </span>

                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(val) => setSelectedYear(Number(val))}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t("Select Year")} />
                      </SelectTrigger>
                      <SelectContent>
                        {[2025, 2026, 2027, 2028].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                }
                className="bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800"
              >
                <div className="h-72">
                  {bookingDiagram.isLoading ? (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      {t("Loading chart")}...
                    </div>
                  ) : (
                    <Chart
                      options={yearlyOptions}
                      series={yearlySeries}
                      type="bar"
                      height="300"
                    />
                  )}
                </div>
              </Panel>
            </div>
          </div>

          {/* Top Books va Top Students yonma yon */}
          <div className="lg:col-span-3 xl:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel
              title={
                <span className="text-purple-700 dark:text-purple-400">
                  {t("Top Books")}
                </span>
              }
              className="bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800"
            >
              {booksTop.isLoading ? (
                <Skeleton className="w-full h-32" />
              ) : booksTop.data?.data?.length === 0 ? (
                <p className="text-muted-foreground">
                  {t("No book data available")}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 mt-[-50px]">
                  {booksTop?.data?.data?.map((book: any, i: number) => {
                    const initials = book.title?.[0]?.toUpperCase() || "?";
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition rounded-lg"
                      >
                        {/* Chap avatar + kitob ma'lumotlari */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-white font-semibold">
                            {initials}
                          </div>

                          <div className="flex flex-col max-w-[250px]">
                            <span className="font-semibold text-[16px] text-gray-900 dark:text-gray-100 truncate">
                              {book.title || t("Unknown Book")}
                            </span>
                            <span className="text-[14px] text-gray-600 dark:text-gray-400 truncate">
                              {book.author || t("Unknown Author")} •{" "}
                              {book.category?.name || t("Unknown Category")}
                            </span>
                          </div>
                        </div>

                        {/* O'qilgan soni */}
                        <div className="flex items-center justify-center bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-[13px] font-bold rounded-xl px-3 py-1 min-w-[50px] text-center">
                          {book.usageCount} {t("usageCount")}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel
              title={
                <span className="text-purple-700 dark:text-purple-400">
                  {t("Top Students")}
                </span>
              }
              className="bg-purple-50 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800"
            >
              {studentsTop.isLoading ? (
                <Skeleton className="w-full h-32" />
              ) : studentsTop.data?.data?.length === 0 ? (
                <p className="text-muted-foreground">
                  {t("No student data available")}
                </p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800 mt-[-50px]">
                  {studentsTop.data.data.map((student: any, i: number) => {
                    const initials = student.name?.[0]?.toUpperCase() || "?";
                    return (
                      <li
                        key={i}
                        className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition rounded-lg"
                      >
                        {/* Chap avatar + ism */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-white font-semibold">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[16px] text-gray-900 dark:text-gray-100">
                              {student.name} {student.surname}
                            </span>
                            <span className="text-[14px] text-gray-600 dark:text-gray-400">
                              {student.degree} • {student.faculty}
                            </span>
                          </div>
                        </div>

                        {/* Kitob soni badge */}
                        <div className="flex items-center justify-center bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-[13px] font-bold rounded-xl px-3 py-1 min-w-[50px] text-center">
                          {student.usageCount} {t("Book")}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>

          {role === "super-admin" && (
            <div className="lg:col-span-3 xl:col-span-6">
              <Panel
                className="bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-800"
                title={
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-green-700 dark:text-green-400">
                        {t("Admins Activity")}
                      </span>
                    </div>
                    <Select
                      value={period}
                      onValueChange={(val: "current-month" | "last-month") =>
                        setPeriod(val)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t("Select period")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-month">
                          {t("Current month")}
                        </SelectItem>
                        <SelectItem value="last-month">
                          {t("Last month")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                }
              >
                <div className="overflow-y-auto max-h-96 mt-[-50px]">
                  {adminsActivity.isLoading ? (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      {t("Loading admins activity")}...
                    </div>
                  ) : adminsActivity.error ? (
                    <div className="flex justify-center items-center h-full text-red-500">
                      {t("Failed to load admins activity")}
                    </div>
                  ) : adminsActivity?.data?.data?.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      {t("No admins activity")}
                    </div>
                  ) : (
                    <div className="space-y-4 mt-[-10px]">
                      {/* Sticky Header */}
                      <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-[20px] text-muted-foreground sticky top-[-3px] bg-green-50 z-10">
                        <div>{t("Admin")}</div>
                        <div>{t("Action Type")}</div>
                        <div>{t("Description")}</div>
                        <div>{t("Time")}</div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        {adminsActivity?.data?.data?.map(
                          (activity: any, i: number) => (
                            <div
                              key={i}
                              className="border-b-2 grid grid-cols-4 gap-4 text-sm"
                            >
                              <div className="text-[16px]">
                                {activity.librarianFullName ||
                                  `${t("Unknown")}`}
                              </div>
                              <div>{activity.actionType || "—"}</div>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-[16px] max-w-[250px] truncate cursor-pointer text-muted-foreground hover:text-foreground">
                                      {activity.description || (
                                        <span className="text-red-500">
                                          No Description
                                        </span>
                                      )}
                                    </div>
                                  </TooltipTrigger>

                                  {activity.description && (
                                    <TooltipContent className="max-w-sm whitespace-pre-wrap break-words">
                                      {activity.description}
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>

                              <div className="text-green-500 text-[16px]">
                                {new Date(activity.time).toLocaleString()}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          )}

          <div className="lg:col-span-3 xl:col-span-6">
            <Panel
              title={
                <span className="text-rose-700 dark:text-rose-400">
                  {t("All Overdue Bookings")}
                </span>
              }
              className="bg-rose-50 dark:bg-rose-800/40 border-rose-200 dark:border-rose-600"
            >
              <div className="overflow-y-auto max-h-96 mt-[-50px]">
                {bookingOverdue.isLoading ? (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    {t("Loading overdue bookings")}...
                  </div>
                ) : bookingOverdue.error ? (
                  <div className="flex justify-center items-center h-full text-red-500">
                    {t("Failed to load overdue bookings")}
                  </div>
                ) : bookingOverdue?.data?.data?.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    {t("No overdue bookings")}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sticky header */}
                    <div className="grid grid-cols-6 gap-4 pb-2 border-b font-medium text-[20px] text-muted-foreground sticky top-[-3px] bg-rose-50 dark:bg-rose-800/40 z-10">
                      <div>{t("Name")}</div>
                      <div>{t("Surname")}</div>
                      <div>{t("Book title")}</div>
                      <div>{t("Author")}</div>
                      <div>{t("Given At")}</div>
                      <div>{t("Due Date")}</div>
                      {/*<div>{t("Action")}</div>*/}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {bookingOverdue?.data?.data?.map(
                        (booking: any, i: number) => (
                          <div
                            key={i}
                            className="border-b-2 grid grid-cols-6 gap-4 text-sm cursor-pointer hover:bg-rose-200 dark:hover:bg-rose-800/60 transition-colors duration-150 rounded-md px-2 py-1"
                            onClick={() =>
                              detailStudent.mutate(booking.studentId)
                            }
                          >
                            <div className="text-[16px] truncate max-w-[150px]">
                              {booking.name || "Unknown Student"}
                            </div>
                            <div className="truncate max-w-[150px]">
                              {booking.surname || "Unknown"}
                            </div>

                            {/* Book title with tooltip */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-[16px] max-w-[200px] truncate text-muted-foreground hover:text-foreground">
                                    {booking.title || "Unknown Book"}
                                  </div>
                                </TooltipTrigger>
                                {booking.title && (
                                  <TooltipContent className="max-w-sm whitespace-pre-wrap break-words">
                                    {booking.title}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>

                            {/* Author with tooltip */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate max-w-[200px] text-muted-foreground hover:text-foreground">
                                    {booking.author || "—"}
                                  </div>
                                </TooltipTrigger>
                                {booking.author && (
                                  <TooltipContent className="max-w-sm whitespace-pre-wrap break-words">
                                    {booking.author}
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>

                            <div className="text-green-500 text-[16px]">
                              {booking.givenAt || booking.due_date || "No Date"}
                            </div>
                            <div className="text-red-500 text-[16px]">
                              {booking.dueDate || booking.due_date || "No Date"}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </div>
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent
          className="bg-white dark:bg-background hide-scroll w-fit"
          side={"center"}
        >
          <SheetHeader>
            <SheetTitle>{t("Student Details")}</SheetTitle>
          </SheetHeader>
          {viewingDetail && (
            <div className="mt-5 mx-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firstName")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.name}
                  </div>
                </div>
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("lastName")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.surname}
                  </div>
                </div>
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("Faculty")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.faculty}
                  </div>
                </div>
                <div className="space-y-2.5 h-full">
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
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("Card number")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.cardNumber}
                  </div>
                </div>
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("Phone number")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.phoneNumber
                      ? viewingDetail.phoneNumber
                      : "-"}
                  </div>
                </div>
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("Admission Time")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.admissionTime}
                  </div>
                </div>
                <div className="space-y-2.5 h-full">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("Graduation Time")}
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {viewingDetail.graduationTime}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  loading,
  valueClassName = "text-green-600",
  iconBg = "bg-green-100 text-green-600",
  borderColor = "border-green-600",
}: {
  title: string;
  value: number | null;
  subtitle: string;
  icon: any;
  loading?: boolean;
  valueClassName?: string;
  iconBg?: string;
  borderColor?: string;
}) => (
  <Card className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 shadow-sm transition hover:shadow-md hover:-translate-y-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className={`p-2 rounded-lg ${borderColor} ${iconBg}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="w-12 h-8" />
      ) : (
        <NumberTicker
          value={value || 0}
          decimalPlaces={0}
          className={`text-2xl font-bold ${valueClassName}`}
        />
      )}
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </CardContent>
  </Card>
);

const Panel = ({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <Card
    className={`
      transition-transform duration-300 hover:scale-[1.01]
      hover:shadow-md border rounded-xl overflow-hidden
      ${className || ""}
    `}
  >
    <CardHeader className="border-b border-border/40 pb-3">
      <CardTitle className="text-lg font-semibold tracking-tight">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-5">{children}</CardContent>
  </Card>
);

export default Dashboard;
