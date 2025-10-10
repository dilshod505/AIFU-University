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
  SquareCheckBig,
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

const Dashboard = () => {
  const t = useTranslations();

  const { user } = useLayoutStore();
  const role = user?.role?.toString().toLowerCase().replace("_", "-");

  const studentsTop = useStudentsTop();
  const studentsCount = useStudentsCount();
  const booksTop = useBooksTop();
  const bookingToday = useBookingsToday();
  const bookingsTodayOverdue = useBookingsTodayOverdue();
  const bookingPerMonth = useBookingsPerMonth();
  const bookingPerDay = useBookingsPerDay();
  const bookingOverdue = useBookingOverdue();
  const bookingDiagram = useBookingsDiagram();
  const bookingCount = useBookingsCount();
  const booksCount = useBooksCount();
  const bookCopiesCount = useBookCopiesCount();
  const averageStatic = useAverageUsage();

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
    chart: { type: "bar", toolbar: { show: true } },
    xaxis: { categories: dayCategories, title: { text: t("Days of Month") } },
    tooltip: { shared: true, intersect: false },
  };

  const perDaySeries = useMemo(
    () => [
      { name: t("Taken"), data: takenPerDay },
      { name: t("Returned"), data: returnedPerDay },
      { name: t("Returned Late"), data: returnedLatePerDay },
    ],
    [takenPerDay, returnedPerDay, returnedLatePerDay, t],
  );

  // -------------------- Yearly (oylik) --------------------
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
          value={bookCopiesCount.isLoading ? null : bookCopiesCount.data?.data}
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
        <Panel title={t("Bookings Per Day")}>
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

        <Panel title={t("Today's Bookings")}>
          {bookingToday.isLoading ? (
            <Skeleton className="w-full h-48" />
          ) : bookingToday.data?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <span className="text-3xl mb-2">
                <SquareCheckBig className="w-10 h-10" />
              </span>
              <p className="font-bold text-lg">
                {t("4 bookings today").replace(
                  "4",
                  bookingToday.data?.data?.length,
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-green-600 max-h-96">
              <ul className="space-y-2 text-sm text-muted-foreground w-full overflow-y-auto hide-scroll">
                {bookingToday?.data?.data?.map((b: any, idx: number) => (
                  <li key={idx} className="border-b pb-2">
                    <p className="text-[18px] font-bold">
                      {b?.studentFullName}
                    </p>
                    <p className="text-[16px]">
                      <span className="font-bold">{t("Book")}:</span> {b.title}{" "}
                      ({b.author})
                    </p>
                    <p className="text-[15px] text-green-600">
                      <span className="font-semibold">{t("Due Date")}:</span>{" "}
                      {new Date(b.dueDate).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title={t("Overdue Bookings")}>
          <div className="flex flex-col items-center justify-center h-48 text-green-600">
            <span className="text-3xl">
              <SquareCheckBig className="w-10 h-10" />
            </span>
            {bookingsTodayOverdue?.isLoading ? (
              <Skeleton suppressHydrationWarning className={"w-56 h-7"} />
            ) : bookingsTodayOverdue?.data?.total === 0 ? (
              <p className="mt-2" suppressHydrationWarning>
                {"No overdue books"}!
              </p>
            ) : (
              <p className="mt-2" suppressHydrationWarning>
                {bookingsTodayOverdue?.data?.total} {t("Today's booking list")}
              </p>
            )}
          </div>
        </Panel>

        <div className="lg:col-span-1 xl:col-span-4">
          <Panel title={t("Monthly Booking Statistics")}>
            <div className="h-64">
              {bookingPerMonth.isLoading ? (
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
            <Panel title={t("Year Statistic")}>
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
          <Panel title={t("Top Books")}>
            {booksTop.isLoading ? (
              <Skeleton className="w-full h-32" />
            ) : booksTop.data?.data?.length === 0 ? (
              <p className="text-muted-foreground">
                {t("No book data available")}
              </p>
            ) : (
              <ul className="space-y-2">
                {booksTop?.data?.data?.map((book: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-[18px]">{book.title}</span>
                      <span className="text-[16px] text-muted-foreground">
                        {book.author} • {book.category?.name}
                      </span>
                    </div>
                    <span className="font-bold text-[16px] text-green-600">
                      {book.usageCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t("Top Students")}>
            {studentsTop.isLoading ? (
              <Skeleton className="w-full h-32" />
            ) : studentsTop.data?.data?.length === 0 ? (
              <p className="text-muted-foreground">
                {t("No student data available")}
              </p>
            ) : (
              <ul className="space-y-2">
                {studentsTop?.data?.data?.map((student: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-[18px]">
                        {student.name} {student.surname}
                      </span>
                      <span className="text-[16px] text-muted-foreground">
                        {student.degree} • {student.faculty}
                      </span>
                    </div>
                    <span className="font-bold text-[16px] text-green-600">
                      {student.usageCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {role === "super-admin" && (
          <div className="lg:col-span-3 xl:col-span-6">
            <Panel
              title={
                <div className="flex items-center justify-between">
                  <span>{t("Admins Activity")}</span>
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
              <div className="overflow-y-auto max-h-96">
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 pb-2 border-b font-medium text-sm text-muted-foreground">
                      <div>{t("Librarian")}</div>
                      <div>{t("Action Type")}</div>
                      <div>{t("Description")}</div>
                      <div>{t("Time")}</div>
                    </div>
                    <div className="space-y-3">
                      {adminsActivity?.data?.data?.map(
                        (activity: any, i: number) => (
                          <div
                            key={i}
                            className="grid grid-cols-4 gap-4 text-sm"
                          >
                            <div className="text-[16px]">
                              {activity.librarianFullName || `${t("Unknown")}`}
                            </div>
                            <div>{activity.actionType || "—"}</div>
                            <div className="text-[16px]">
                              {activity.description || "No Description"}
                            </div>
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
          <Panel title={t("All Overdue Bookings")}>
            <div className="overflow-y-auto max-h-96">
              {bookingOverdue.isLoading ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  {t("Loading overdue bookings")}...
                </div>
              ) : bookingOverdue.error ? (
                <div className="flex justify-center items-center h-full text-red-500">
                  {t("Failed to load overdue bookings")}
                </div>
              ) : bookingOverdue?.data?.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  {t("No overdue bookings")}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4 pb-2 border-b font-medium text-sm text-muted-foreground">
                    <div>{t("firstName")}</div>
                    <div>{t("Surname")}</div>
                    <div>{t("book title")}</div>
                    <div>{t("Author")}</div>
                    <div>{t("Given At")}</div>
                    <div>{t("Due Date")}</div>
                  </div>
                  <div className="space-y-3">
                    {bookingOverdue?.data?.data?.map(
                      (booking: any, i: number) => (
                        <div key={i} className="grid grid-cols-6 gap-4 text-sm">
                          <div className="text-[16px]">
                            {booking.name || "Unknown Student"}
                          </div>
                          <div>{booking.surname || "Unknown"}</div>
                          <div className="text-[16px]">
                            {booking.title || "Unknown Book"}
                          </div>
                          <div>{booking.author || ""}</div>
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
    className={`transition-transform duration-300 hover:scale-102 hover:shadow-lg ${className || ""}`}
  >
    <CardHeader>
      <CardTitle className="text-md">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default Dashboard;
