"use client";

import {
  useAdmin,
  useAdminActivity,
  useAdminActivityAnalytics,
  useAdminActivityToday,
  useAdminExtendedBooks,
  useAdminIssuedBooks,
  useAdminReturnBooks,
  useProfile,
} from "@/components/models/queries/profile";
import { useTranslations } from "next-intl";
import Chart from "react-apexcharts";
import { Card, CardContent } from "@/components/ui/card";
import TooltipBtn from "@/components/tooltip-btn";
import { UserRoundPen } from "lucide-react";
import { ApexOptions } from "apexcharts";

const Profile = () => {
  const t = useTranslations();

  // queries
  const { data: profile } = useProfile();
  const { data: me } = useAdmin();
  const { data: returnBooks } = useAdminReturnBooks();
  const { data: issuedBooks } = useAdminIssuedBooks();
  const { data: extendedBooks } = useAdminExtendedBooks();
  const { data: activity } = useAdminActivity();
  const { data: activityToday } = useAdminActivityToday();
  const { data: analytics } = useAdminActivityAnalytics();

  const todayPieChartOptions: ApexOptions = {
    labels: [t("Issued"), t("Returned"), t("Extended")],
    colors: ["#22c55e", "#3b82f6", "#f59e0b"],
    legend: { position: "bottom" },
  };

  const todayPieChartSeries = [
    activityToday?.data?.analytics?.issuedCount ?? 0,
    activityToday?.data?.analytics?.returnedCount ?? 0,
    activityToday?.data?.analytics?.extendedCount ?? 0,
  ];

  const analyticsChartOptions: ApexOptions = {
    chart: { type: "line", toolbar: { show: false } },
    stroke: { curve: "smooth" },
    xaxis: {
      categories: analytics?.data?.map((item: any) => item.day) ?? [],
    },
  };

  const analyticsChartSeries = [
    {
      name: t("Issued"),
      data: analytics?.data?.map((item: any) => item.issued) ?? [],
    },
    {
      name: t("Returned"),
      data: analytics?.data?.map((item: any) => item.returned) ?? [],
    },
    {
      name: t("Extended"),
      data: analytics?.data?.map((item: any) => item.extended) ?? [],
    },
  ];

  const pieChartOptions: ApexOptions = {
    labels: [t("Issued"), t("Returned"), t("Extended")],
    colors: ["#22c55e", "#3b82f6", "#f59e0b"],
    legend: { position: "bottom" },
  };
  const pieChartSeries = [
    issuedBooks?.data?.totalCount ?? 0,
    returnBooks?.data?.count ?? 0,
    extendedBooks?.data?.count ?? 0,
  ];

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.data?.role}</h1>
            <p className="font-bold">{profile?.data?.name}</p>
            <p className=" text-sm">{profile?.data?.email}</p>
          </div>
        </div>
        <TooltipBtn title={"Edit"} className="text-white">
          <UserRoundPen />
        </TooltipBtn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs font-medium  uppercase tracking-wide mb-2">
              {t("Issued Books")}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {issuedBooks?.data?.totalCount ?? 0}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-emerald-600 font-medium text-2xl">
                  ↗ +{issuedBooks?.data?.totalPercent ?? 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs font-medium  uppercase tracking-wide mb-2">
              {t("Returned Books")}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {returnBooks?.data?.count ?? 0}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-blue-600 font-medium text-2xl">
                  ↗ +{returnBooks?.data?.percent ?? 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs font-medium  uppercase tracking-wide mb-2">
              {t("Extended Books")}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {extendedBooks?.data?.count ?? 0}
              </div>
              <div className="flex items-center text-xs">
                <span className="text-orange-600 font-medium text-2xl">
                  ↗ +{extendedBooks?.data?.percent ?? 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution to global stats */}
      <Card className="shadow-sm mt-6 mb-5">
        <CardContent className="p-4">
          <h3 className="text-xs font-medium  uppercase tracking-wide mb-2">
            {t("Contribution to Global Statistics")}
          </h3>
          <p className="text-sm">
            {t("Your issues this month")}:{" "}
            <span className="font-semibold">
              {activity?.data?.analytics?.issuedCount ?? 0}
            </span>{" "}
            &nbsp; {t("Total in library")}:{" "}
            <span className="font-semibold">
              {activity?.data?.analytics?.totalCount ?? 0}
            </span>
            &nbsp; {t("Share")}:{" "}
            <span className="font-semibold">
              {activity?.data?.analytics?.totalCount}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("Today Books Status")}
            </h3>
            <Chart
              options={todayPieChartOptions}
              series={todayPieChartSeries}
              type="pie"
              height={250}
            />
          </CardContent>
        </Card>
        <Card className="shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("Today Recent Activity")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Date & Time")}
                    </th>
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Invoice number")}
                    </th>
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Action")}
                    </th>
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Details")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activityToday?.data?.activities?.length > 0 ? (
                    activityToday.data.activities.map(
                      (item: any, i: number) => (
                        <tr key={i} className="border-b border-gray-100">
                          {/* Time */}
                          <td className="py-3 text-sm">
                            {new Date(item.time).toLocaleString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          <td className="py-3 text-sm">
                            <span>{item.bookInventoryNumber}</span>
                          </td>
                          <td className="py-3 text-sm font-medium">
                            {item.action === "ISSUED" && t("Issued")}
                            {item.action === "RETURNED" && t("Returned")}
                            {item.action === "EXTENDED" && t("Extended")}
                          </td>

                          {/* Details */}
                          <td className="py-3 text-sm">
                            "{item.bookTitle}" — {item.bookAuthor} <br />
                            <span className=" text-xs">
                              {t("Student")}: {item.studentSurname}{" "}
                              {item.studentName}
                            </span>
                          </td>
                        </tr>
                      ),
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center ">
                        {t("No activity yet")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-5">
        {/* Analytics Status */}
        <Card className="shadow-sm lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("Analytics Status")}
            </h3>
            <Chart
              options={analyticsChartOptions}
              series={analyticsChartSeries}
              type="line"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">
        <Card className="shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("Recent Activity")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Date & Time")}
                    </th>
                    <th
                      className={
                        "pb-3 text-xs font-medium  uppercase tracking-wide"
                      }
                    >
                      {t("Invoice number")}
                    </th>
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Action")}
                    </th>
                    <th className="pb-3 text-xs font-medium  uppercase tracking-wide">
                      {t("Details")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activity?.data?.activities?.length > 0 ? (
                    activity.data.activities.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100">
                        {/* Time */}
                        <td className="py-3 text-sm">
                          {new Date(item.time).toLocaleString("ru-RU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        <td className="py-3 text-sm">
                          <span>{item.bookInventoryNumber}</span>
                        </td>
                        <td className="py-3 text-sm font-medium">
                          {item.action === "ISSUED" && t("Issued")}
                          {item.action === "RETURNED" && t("Returned")}
                          {item.action === "EXTENDED" && t("Extended")}
                        </td>

                        {/* Details */}
                        <td className="py-3 text-sm">
                          "{item.bookTitle}" — {item.bookAuthor} <br />
                          <span className=" text-xs">
                            {t("Student")}: {item.studentSurname}{" "}
                            {item.studentName}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center ">
                        {t("No activity yet")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("Books Status")}</h3>
            <Chart
              options={pieChartOptions}
              series={pieChartSeries}
              type="pie"
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="shadow-sm mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("Recent Activity")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2">{t("F.I.O")}</th>
                  <th className="px-4 py-2">{t("Issued")}</th>
                  <th className="px-4 py-2">{t("Extended")}</th>
                  <th className="px-4 py-2">{t("Returned")}</th>
                  <th className="px-4 py-2">{t("Total")}</th>
                </tr>
              </thead>
              <tbody>
                {me?.data?.length > 0 ? (
                  me.data.map((admin: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-3 text-sm font-bold">
                        {admin.name} {admin.surname}
                      </td>
                      <td className="py-3 text-sm">
                        {admin.analytics.issuedCount}
                      </td>
                      <td className="py-3 text-sm">
                        {admin.analytics.extendedCount}
                      </td>
                      <td className="py-3 text-sm">
                        {admin.analytics.returnedCount}
                      </td>
                      <td className="py-3 text-sm">
                        {admin.analytics.totalCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center ">
                      {t("No data")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
