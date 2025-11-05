// "use client";
//
// import { AutoForm } from "@/components/form/auto-form";
// import { api } from "@/components/models/axios";
// import {
//   useGetNotificationById,
//   useGetNotifications,
// } from "@/components/models/queries/notification";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useTranslations } from "next-intl";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
//
// const Notifications = () => {
//   const t = useTranslations();
//   const form = useForm();
//   const queryClient = useQueryClient();
//   const { data: notifications } = useGetNotifications();
//   const [extendingNotification, setExtendingNotification] = useState<
//     number | null
//   >(null);
//   const [selected, setSelected] = useState<{ id: number; type: string } | null>(
//     null,
//   );
//   const { data: detail } = useGetNotificationById(selected?.id || undefined);
//
//   // useNotificationsSocket();
//
//   const accept = useMutation({
//     mutationFn: async ({
//       extendDays,
//       notificationId,
//     }: {
//       notificationId: number;
//       extendDays: number;
//     }) => {
//       const res = await api.post("/admin/actions/extend/accept", {
//         extendDays: +extendDays,
//         notificationId,
//       });
//       return res.data;
//     },
//   });
//   const reject = useMutation({
//     mutationFn: async ({ notificationId }: { notificationId: number }) => {
//       const res = await api.post("/admin/actions/extend/reject", {
//         notificationId,
//       });
//       return res.data;
//     },
//   });
//
//   return (
//     <div>
//       <h1 className="text-2xl font-semibold py-5">{t("Notifications")}</h1>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* LEFT SIDE */}
//         <div className="md:col-span-1">
//           <Tabs
//             defaultValue="EXTEND"
//             className="w-full"
//             onValueChange={() => setSelected(null)}
//           >
//             <TabsList className="mb-5 w-full">
//               <TabsTrigger
//                 value="EXTEND"
//                 className="flex-1 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
//               >
//                 {t("uzaytirish")}
//               </TabsTrigger>
//               <TabsTrigger
//                 value="WARNING"
//                 className="flex-1 data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
//               >
//                 {t("warning")}
//               </TabsTrigger>
//             </TabsList>
//
//             <TabsContent value="EXTEND">
//               <div className="flex flex-col gap-3">
//                 {(notifications?.data?.data || [])
//                   .filter((n: any) => n.notificationType === "EXTEND")
//                   .map((n: any) => (
//                     <Card
//                       key={n.id}
//                       className={`cursor-pointer transition hover:shadow-md ${
//                         selected?.id === n.id ? "border-green-700 border-2" : ""
//                       }`}
//                       onClick={() => setSelected({ id: n.id, type: "EXTEND" })}
//                     >
//                       <CardContent className="p-3">
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <p className="font-medium">
//                               {n.name} {n.surname}
//                             </p>
//                             <p className="text-xs text-gray-500">{n.date}</p>
//                           </div>
//                           <Badge className="bg-green-100 text-green-700">
//                             {t("uzaytirish")}
//                           </Badge>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//               </div>
//             </TabsContent>
//
//             {/* WARNING list */}
//             <TabsContent value="WARNING">
//               <div className="flex flex-col gap-3">
//                 {(notifications?.data?.data || [])
//                   .filter((n: any) => n.notificationType === "WARNING")
//                   .map((n: any) => (
//                     <Card
//                       key={n.id}
//                       className={`cursor-pointer transition hover:shadow-md ${
//                         selected?.id === n.id ? "border-red-700" : ""
//                       }`}
//                       onClick={() => setSelected({ id: n.id, type: "WARNING" })}
//                     >
//                       <CardContent className="px-3">
//                         <div className="flex justify-end items-center">
//                           <Badge className="text-sm bg-red-100 text-red-700">
//                             {t("warning")}
//                           </Badge>
//                         </div>
//                         <div className="mt-2">
//                           <p className="font-medium">{n.bookTitle}</p>
//                           <p className="text-xs text-gray-500">{n.date}</p>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   ))}
//               </div>
//             </TabsContent>
//           </Tabs>
//         </div>
//
//         <div className="md:col-span-2 mt-16">
//           {!selected || !detail ? (
//             <div className="flex items-center justify-center h-full rounded-lg border p-10 text-center">
//               <div>
//                 <div className="text-gray-400 text-5xl mb-3">📋</div>
//                 <h2 className="font-semibold text-gray-600">
//                   {t("No notification selected")}
//                 </h2>
//                 <p className="text-lg text-gray-500">
//                   {t("Click on a notification to view its details")}
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <Card className="shadow-sm">
//               <CardContent className="p-5 space-y-4">
//                 <div className={"flex justify-between items-center"}>
//                   <div>
//                     <h2 className="text-3xl font-semibold">
//                       {t("Notification detail")}
//                     </h2>
//                   </div>
//                   <div>
//                     {selected?.type === "EXTEND" && (
//                       <Badge className="bg-green-100 text-green-700 text-lg">
//                         {t("uzaytirish")}
//                       </Badge>
//                     )}
//                     {selected?.type === "WARNING" && (
//                       <Badge className="bg-red-100 text-red-700 text-lg">
//                         {t("warning")}
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//                 {selected.type === "EXTEND" && detail?.data?.student && (
//                   <div className="space-y-1">
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Name")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.student.name}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Surname")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.student.surname}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Faculty")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.student.faculty}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Degree")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.student.degree}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Card number")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.student.cardNumber}
//                       </span>
//                     </p>
//                   </div>
//                 )}
//
//                 {detail?.data?.book && (
//                   <div className="space-y-1">
//                     <h3 className="text-2xl font-bold mb-2">📚 {t("Book")}</h3>
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Title")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.book.title}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">{t("Author")}:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.book.author}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">ISBN:</span>{" "}
//                       <span className="font-normal">
//                         {detail.data.book.isbn}
//                       </span>
//                     </p>
//                     <p className="text-lg">
//                       <span className="font-bold">
//                         {t("Inventory number")}:
//                       </span>{" "}
//                       <span className="font-normal">
//                         {detail.data.book.inventoryNumber}
//                       </span>
//                     </p>
//                     <div className="flex justify-start items-center gap-3 mt-3">
//                       <Button
//                         onClick={() => {
//                           setExtendingNotification(selected.id);
//                         }}
//                         size={"sm"}
//                       >
//                         {t("accept")}
//                       </Button>
//                       <Button
//                         onClick={() => {
//                           if (extendingNotification) {
//                             reject.mutate({
//                               notificationId: extendingNotification,
//                             });
//                           }
//                         }}
//                         size={"sm"}
//                         variant={"destructive"}
//                       >
//                         {t("reject")}
//                       </Button>
//                     </div>
//                   </div>
//                 )}
//                 <div></div>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>
//       <Sheet
//         open={!!extendingNotification}
//         onOpenChange={() => setExtendingNotification(null)}
//       >
//         <SheetContent>
//           <SheetHeader>
//             <SheetTitle asChild>
//               <h1>{t("ijara vaqtini uzaytirish")}</h1>
//             </SheetTitle>
//             <AutoForm
//               submitText={t("ijara vaqtini uzaytirish")}
//               className="p-0 my-5 border-0 bg-transparent"
//               onSubmit={async (values: Record<string, any>) => {
//                 if (extendingNotification) {
//                   accept.mutate({
//                     extendDays: values.extendDays,
//                     notificationId: extendingNotification,
//                   });
//                 }
//                 form.reset();
//                 await queryClient.invalidateQueries({
//                   queryKey: ["notifications"],
//                 });
//                 setExtendingNotification(null);
//               }}
//               fields={[
//                 {
//                   label: t("yana necha kunga ijarani uzaytirmoqchisiz"),
//                   name: "extendDays",
//                 },
//               ]}
//               form={form}
//             />
//           </SheetHeader>
//         </SheetContent>
//       </Sheet>
//     </div>
//   );
// };
//
// export default Notifications;
