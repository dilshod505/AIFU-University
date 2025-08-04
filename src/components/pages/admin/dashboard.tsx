"use client";

import { useTranslations } from "next-intl";
import Chart from "react-apexcharts";
import {
  useAverageUsage,
  useBookCopiesCount,
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ApexOptions } from "apexcharts";
import { SquareCheckBig } from "lucide-react";

const Dashboard = () => {
  const t = useTranslations();

  const averageStatic = useAverageUsage();
  const bookCopiesCount = useBookCopiesCount();
  const bookingCount = useBookingsCount();
  const bookingDiagram = useBookingsDiagram();
  const bookingPerDay = useBookingsPerDay();
  const bookingPerMonth = useBookingsPerMonth();
  const bookingToday = useBookingsToday();
  const bookingsTodayOverdue = useBookingsTodayOverdue();
  const booksCount = useBooksCount();
  const booksTop = useBooksTop();
  const studentsCount = useStudentsCount();
  const studentsTop = useStudentsTop();

  const chartData = Array.isArray(bookingDiagram.data)
    ? bookingDiagram.data
    : [];

  const categories = chartData.map((item) => item.month);
  const bookingsSeries = chartData.map((item) => item.bookings);
  const returnsSeries = chartData.map((item) => item.returns);

  const chartOptions: ApexOptions = {
    chart: {
      type: "line", // ✅ TypeScript buni "line" deb aniq taniydi
      toolbar: {
        show: true,
      },
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    markers: {
      size: 5,
    },
    tooltip: {
      shared: true,
    },
  };

  const chartSeries = [
    {
      name: "Bookings",
      data: [10, 41, 35, 51, 49, 62, 69],
    },
  ];

  return (
    <div className="p-6 bg-muted min-h-screen">
      <h1 className="text-3xl font-bold mb-6">{t("Dashboard")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={studentsCount.data?.data || 0}
          subtitle="Registered library members"
          icon="👤"
        />
        <StatCard
          title="Total Books"
          value={booksCount.data?.data || 0}
          subtitle="Books in collection"
          icon="📚"
        />
        <StatCard
          title="Book Copies"
          value={bookCopiesCount.data?.data || 0}
          subtitle="Physical book copies"
          icon="📖"
        />
        <StatCard
          title="Total Bookings"
          value={bookingCount.data?.data || 0}
          subtitle="All time bookings"
          icon="🗓️"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Panel title="Booking Status">
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <span className="text-3xl">📅</span>
            <p className="text-center mt-2">
              No booking data available
              <br />
              Check back later for updates
            </p>
          </div>
        </Panel>

        <Panel title="Today's Bookings">
          <div className="flex flex-col items-center justify-center h-48 text-green-600">
            <span className="text-3xl">
              <SquareCheckBig className="w-10 h-10" />
            </span>
            <p className="mt-2">
              {bookingToday.data?.total === 0
                ? "No bookings today"
                : `${bookingToday.data?.data} Today's booking list`}
            </p>
          </div>
        </Panel>

        <Panel title="Overdue Bookings">
          <div className="flex flex-col items-center justify-center h-48 text-green-600">
            <span className="text-3xl">
              <SquareCheckBig className="w-10 h-10" />
            </span>
            <p className="mt-2">
              {bookingsTodayOverdue?.data?.data === 0
                ? "No overdue books!"
                : `${bookingsTodayOverdue.data?.data} Today's booking list`}
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Annual Statistics">
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
              options={chartOptions}
              series={chartSeries}
              type="line"
              height="100%"
              width="100%"
            />
          )}
        </div>
      </Panel>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <span className="text-2xl">{icon}</span>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
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
