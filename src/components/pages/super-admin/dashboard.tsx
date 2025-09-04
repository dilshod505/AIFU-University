"use client";

import type React from "react";

import { NumberTicker } from "@/components/magicui/number-ticker"; // Magic UI import
import {
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
import Chart from "react-apexcharts";

const Dashboard = () => {
  const t = useTranslations();

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

  const perMonthData = bookingPerMonth.data?.data || [];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthCategories = perMonthData.map(
    (item: any) => monthNames[item.month - 1],
  );
  const takenPerMonth = perMonthData.map((item: any) => item.taken);
  const returnedPerMonth = perMonthData.map((item: any) => item.returned);
  const returnedLatePerMonth = perMonthData.map(
    (item: any) => item.returnedLate,
  );

  const perMonthOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: true } },
    xaxis: { categories: monthCategories },
    tooltip: { shared: true, intersect: false },
  };

  const perMonthSeries = [
    { name: "Taken", data: takenPerMonth },
    { name: "Returned", data: returnedPerMonth },
    { name: "Returned Late", data: returnedLatePerMonth },
  ];

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t("Dashboard")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          title={t("Total Users")}
          value={studentsCount.isLoading ? null : studentsCount.data?.data}
          loading={studentsCount.isLoading}
          subtitle={t("Registered library members")}
          icon={<Users />}
        />
        <StatCard
          title={t("Total Books")}
          value={booksCount.isLoading ? null : booksCount.data?.data}
          loading={booksCount.isLoading}
          subtitle={t("Books in collection")}
          icon={<BookCopy />}
        />
        <StatCard
          title={t("Book Copies")}
          value={bookCopiesCount.isLoading ? null : bookCopiesCount.data?.data}
          loading={bookCopiesCount.isLoading}
          subtitle={t("Physical book copies")}
          icon={<BookOpen />}
        />
        <StatCard
          title={t("Total Bookings")}
          value={bookingCount.isLoading ? null : bookingCount.data?.data}
          loading={bookingCount.isLoading}
          subtitle={t("All time bookings")}
          icon={<CalendarDays />}
        />
        <StatCard
          title={t("Overdue Total")}
          value={
            bookingOverdue.isLoading ? null : bookingOverdue?.data?.totalPages
          }
          loading={bookingOverdue.isLoading}
          subtitle={t("All overdue bookings")}
          icon={<SquareCheckBig />}
        />
        <StatCard
          title={t("Average Usage")}
          value={
            averageStatic.isLoading
              ? null
              : averageStatic.data?.data?.averageDays
          }
          loading={averageStatic.isLoading}
          subtitle={t("Avg. books per student")}
          icon={<BookOpen />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2 gap-4 mb-6">
        <Panel title={t("Bookings Per Day")}>
          {bookingPerDay.isLoading ? (
            <Skeleton className="w-full h-48" />
          ) : (
            <Chart
              type="donut"
              height="300"
              options={{
                labels: ["Taken", "Returned", "Returned Late"],
                legend: { position: "bottom" },
              }}
              series={[
                bookingPerDay.data?.data?.at(-1)?.taken || 0,
                bookingPerDay.data?.data?.at(-1)?.returned || 0,
                bookingPerDay.data?.data?.at(-1)?.returnedLate || 0,
              ]}
            />
          )}
        </Panel>

        <Panel title="Monthly Booking Statistics">
          <div className="h-64">
            {bookingPerMonth.isLoading ? (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                Loading chart...
              </div>
            ) : (
              <Chart
                options={perMonthOptions}
                series={perMonthSeries}
                type="bar"
                height="250"
              />
            )}
          </div>
        </Panel>

        <div className="lg:col-span-3 xl:col-span-2">
          <Panel title={t("Statistics")}>
            <div className="h-72">
              {bookingDiagram.isLoading ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  Loading chart...
                </div>
              ) : bookingDiagram.error ? (
                <div className="flex justify-center items-center h-full text-red-500">
                  Failed to load chart data
                </div>
              ) : (
                <Chart
                  options={perMonthOptions}
                  series={perMonthSeries}
                  type="bar"
                  height="300"
                />
              )}
            </div>
          </Panel>
        </div>

        <Panel title={t("Top Books")}>
          {booksTop.isLoading ? (
            <Skeleton className="w-full h-32" />
          ) : booksTop.data?.data?.length === 0 ? (
            <p className="text-muted-foreground">No book data available</p>
          ) : (
            <ul className="space-y-2">
              {booksTop.data.data.map((book: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{book.title}</span>
                  <span className="font-bold">{book?.data?.totalBookings}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("Top Students")}>
          {studentsTop.isLoading ? (
            <Skeleton className="w-full h-32" />
          ) : studentsTop.data?.data?.length === 0 ? (
            <p className="text-muted-foreground">No student data available</p>
          ) : (
            <ul className="space-y-2">
              {studentsTop?.data?.data?.map((student: any, i: number) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{student?.data?.userName}</span>
                  <span className="font-bold">{student.totalBookings}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("Today's Bookings")}>
          <div className="flex flex-col items-center justify-center h-48 text-green-600">
            <span className="text-3xl">
              <SquareCheckBig className="w-10 h-10" />
            </span>
          </div>
        </Panel>

        <Panel title={t("Overdue Bookings")}>
          <div className="flex flex-col items-center justify-center h-48 text-green-600">
            <span className="text-3xl">
              <SquareCheckBig className="w-10 h-10" />
            </span>
            {bookingsTodayOverdue?.isLoading ? (
              <Skeleton suppressHydrationWarning className={"w-56 h-7"} />
            ) : bookingsTodayOverdue.data.total === 0 ? (
              <p className="mt-2" suppressHydrationWarning>
                No overdue books!
              </p>
            ) : (
              <p className="mt-2" suppressHydrationWarning>
                {bookingsTodayOverdue.data?.data} {t("Today's booking list")}
              </p>
            )}
          </div>
        </Panel>

        <div className="lg:col-span-3 xl:col-span-2">
          <Panel title={t("All Overdue Bookings")}>
            <div className="h-72 overflow-auto">
              {bookingOverdue.isLoading ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  Loading overdue bookings...
                </div>
              ) : bookingOverdue.error ? (
                <div className="flex justify-center items-center h-full text-red-500">
                  Failed to load overdue bookings
                </div>
              ) : bookingOverdue?.data?.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No overdue bookings
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 pb-2 border-b font-medium text-sm text-muted-foreground">
                    <div>STUDENT</div>
                    <div>BOOK TITLE</div>
                    <div>DUE DATE</div>
                  </div>
                  <div className="space-y-3">
                    {bookingOverdue?.data?.data?.data?.map(
                      (booking: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 gap-4 text-sm">
                          <div className="font-medium">
                            {booking.studentName ||
                              booking.student?.name ||
                              "Unknown Student"}
                          </div>
                          <div className="text-muted-foreground">
                            {booking.bookTitle ||
                              booking.book?.title ||
                              "Unknown Book"}
                          </div>
                          <div className="text-red-500 font-medium">
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
}: {
  title: string;
  value: number | null;
  subtitle: string;
  icon: any;
  loading?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <span className="text-2xl">{icon}</span>
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton suppressHydrationWarning className="w-12 h-8" />
      ) : (
        <NumberTicker
          value={value || 0}
          decimalPlaces={0}
          className="text-2xl font-bold"
        />
      )}
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
);

const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-md">{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default Dashboard;
