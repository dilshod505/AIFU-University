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
  useUpdateProfile,
} from "@/components/models/queries/profile";
import { useTranslations } from "next-intl";
import Chart from "react-apexcharts";
import { Card, CardContent } from "@/components/ui/card";
import TooltipBtn from "@/components/tooltip-btn";
import { CircleUserRound, UserRoundPen } from "lucide-react";
import { ApexOptions } from "apexcharts";
import { useMemo, useState } from "react";
import { Image, Select } from "antd";
import { Modal, Form, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { api } from "@/components/models/axios";

const Profile = () => {
  const t = useTranslations();
  const [monthFilter, setMonthFilter] = useState("current");
  const currentMonth = new Date().getMonth(); // 0-11
  const currentYear = new Date().getFullYear();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: me } = useAdmin();
  const { data: returnBooks } = useAdminReturnBooks();
  const { data: issuedBooks } = useAdminIssuedBooks();
  const { data: extendedBooks } = useAdminExtendedBooks();
  const { data: activity } = useAdminActivity();
  const { data: activityToday } = useAdminActivityToday();
  const { data: analytics } = useAdminActivityAnalytics();

  const editProfile = () => {
    form.setFieldsValue({
      name: profile?.data?.name,
      surname: profile?.data?.surname,
    });

    if (profile?.data?.imageUrl) {
      setFileList([
        {
          uid: "-1",
          name: "current.png",
          status: "done",
          url: profile.data.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }

    setIsModalOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      let imageUrl = profile?.data?.imageUrl;

      // Agar yangi fayl yuklansa → serverga yuborish
      if (fileList[0]?.originFileObj) {
        const formData = new FormData();
        formData.append("file", fileList[0].originFileObj);

        const res = await api.post("/admin/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = res.data?.data?.url; // server qaytaradigan fieldni tekshir
      }

      updateProfile.mutate(
        { ...values, imageUrl },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setFileList([]);
          },
        },
      );
    } catch (err) {
      console.log("Validation failed:", err);
    }
  };

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

  const filteredData = useMemo(() => {
    return (
      analytics?.data?.filter((item: any) => {
        const date = new Date(item.day);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (monthFilter === "current") {
          return month === currentMonth && year === currentYear;
        }
        if (monthFilter === "previous") {
          return (
            month === (currentMonth === 0 ? 11 : currentMonth - 1) &&
            year === (currentMonth === 0 ? currentYear - 1 : currentYear)
          );
        }
        return true;
      }) ?? []
    );
  }, [analytics, monthFilter, currentMonth, currentYear]);

  const analyticsChartOptions: ApexOptions = {
    chart: { type: "line", toolbar: { show: false } },
    stroke: { curve: "smooth" },
    xaxis: { categories: filteredData?.map((item: any) => item.day) },
  };

  const analyticsChartSeries = [
    {
      name: t("Issued"),
      data: filteredData.map((item: any) => item.issued),
    },
    {
      name: t("Returned"),
      data: filteredData.map((item: any) => item.returned),
    },
    {
      name: t("Extended"),
      data: filteredData.map((item: any) => item.extended),
    },
  ];

  const pieChartOptions: ApexOptions = {
    labels: [t("Issued"), t("Returned"), t("Extended")],
    colors: ["#22c55e", "#3b82f6", "#f59e0b"],
    legend: { position: "bottom" },
  };
  const pieChartSeries = [
    activity?.data?.analytics?.issuedCount ?? 0,
    activity?.data?.analytics?.returnedCount ?? 0,
    activity?.data?.analytics?.extendedCount ?? 0,
  ];

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-4">
            {profile?.data?.imageUrl ? (
              <Image
                width={55}
                height={55}
                src={profile?.data?.imageUrl}
                alt={profile?.data?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <CircleUserRound className="w-12 h-12 text-gray-400" />
            )}

            <div>
              <p className="text-2xl font-bold">{profile?.data?.name}</p>
              <p className="text-sm">{profile?.data?.email}</p>
              <h1 className="font-bold">{profile?.data?.role}</h1>
            </div>
          </div>
        </div>
        <TooltipBtn title={"Edit"} className="text-white" onClick={editProfile}>
          <UserRoundPen />
        </TooltipBtn>
      </div>

      <Modal
        title={t("Edit Profile")}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={onSubmit}
        confirmLoading={updateProfile.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name={t("name")}
            label={t("Name")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={t("surname")}
            label={t("Surname")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={t("Image")}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false} // avtomatik yubormasin
              maxCount={1}
              accept="image/*"
            >
              {fileList.length >= 1 ? null : (
                <Button icon={<UploadOutlined />}>{t("Upload")}</Button>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
        {/* Issued Books */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide mb-2">
              {t("Issued Books")}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {issuedBooks?.data?.totalCount ?? 0}
              </div>
              <div className="flex items-center text-xs">
                {issuedBooks?.data?.totalPercent > 0 ? (
                  <span className="text-emerald-600 font-medium text-2xl">
                    ↗ +{issuedBooks?.data?.totalPercent}%
                  </span>
                ) : issuedBooks?.data?.totalPercent < 0 ? (
                  <span className="text-red-600 font-medium text-2xl">
                    ↘ {issuedBooks?.data?.totalPercent}%
                  </span>
                ) : (
                  <span className="text-gray-500 font-medium text-2xl">
                    → 0%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Returned Books */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide mb-2">
              {t("Returned Books")}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {returnBooks?.data?.count ?? 0}
              </div>
              <div className="flex items-center text-xs">
                {returnBooks?.data?.percent > 0 ? (
                  <span className="text-blue-600 font-medium text-2xl">
                    ↗ +{returnBooks?.data?.percent}%
                  </span>
                ) : returnBooks?.data?.percent < 0 ? (
                  <span className="text-red-600 font-medium text-2xl">
                    ↘ {returnBooks?.data?.percent}%
                  </span>
                ) : (
                  <span className="text-blue-500 font-medium text-2xl">
                    → 0%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Extended Books */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="text-xs font-medium uppercase tracking-wide mb-2">
              {t("Extended Books")}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">
                {extendedBooks?.data?.count ?? 0}
              </div>
              <div className="flex items-center text-xs">
                {extendedBooks?.data?.percent > 0 ? (
                  <span className="text-orange-600 font-medium text-2xl">
                    ↗ +{extendedBooks?.data?.percent}%
                  </span>
                ) : extendedBooks?.data?.percent < 0 ? (
                  <span className="text-red-600 font-medium text-2xl">
                    ↘ {extendedBooks?.data?.percent}%
                  </span>
                ) : (
                  <span className="text-red-500 font-medium text-2xl">
                    → 0%
                  </span>
                )}
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
              height={350}
            />
          </CardContent>
        </Card>
        <Card className="shadow-sm lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("Today Recent Activity")}
            </h3>
            <div className="overflow-y-auto max-h-96">
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
            <Select
              value={monthFilter}
              onChange={setMonthFilter}
              style={{ width: 150 }}
              options={[
                { value: "current", label: t("Current Month") },
                { value: "previous", label: t("Previous Month") },
              ]}
            />
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
            <div className="overflow-y-auto max-h-96">
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
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="shadow-sm mt-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t("Data")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">{t("Image")}</th>
                  <th className="px-4 py-2 text-left">{t("F.I.O")}</th>
                  <th className="px-4 py-2 text-center">{t("Issued")}</th>
                  <th className="px-4 py-2 text-center">{t("Extended")}</th>
                  <th className="px-4 py-2 text-center">{t("Returned")}</th>
                  <th className="px-4 py-2 text-center">{t("Total")}</th>
                </tr>
              </thead>
              <tbody>
                {me?.data?.length > 0 ? (
                  me.data.map((admin: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {admin.imageUrl ? (
                          <Image
                            width={36}
                            height={36}
                            src={admin.imageUrl}
                            alt={`${admin.name} ${admin.surname}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <CircleUserRound className="text-gray-400 w-8 h-8" />
                        )}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {admin.name} {admin.surname}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin.analytics.issuedCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin.analytics.extendedCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {admin.analytics.returnedCount}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {admin.analytics.totalCount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
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
