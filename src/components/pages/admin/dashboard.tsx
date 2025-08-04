"use client";

import { useTranslations } from "next-intl";
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

  return (
    <div className={"cont"}>
      <h1 className={"text-2xl font-semibold py-5"}>{t("Dashboard")}</h1>
      <div className="grid grid-cols-4 gap-5">
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          1
        </div>
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          2
        </div>
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          3
        </div>
        <div
          className={
            "h-40 rounded-2xl flex justify-center items-center bg-card"
          }
        >
          4
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
