import { api } from "@/components/models/axios";
import { BookingFormData, ExtendFormData } from "@/types/booking";

export async function getBookings(
  pageNum: number,
  pageSize: number,
): Promise<any> {
  const response = await api.get(
    `/admin/booking?pageNum=${pageNum}&pageSize=10`,
  );
  return response.data;
}

export async function getBookingById(id: string): Promise<any> {
  const response = await api.get(`/admin/booking/${id}`);
  return response.data;
}

export async function searchBookings(
  query: string,
  field: string,
): Promise<any> {
  const response = await api.get(
    `/admin/booking/search?query=${encodeURIComponent(query)}&field=${field}`,
  );
  return response.data;
}

export async function borrowBook(data: BookingFormData): Promise<any> {
  const response = await api.post("/admin/booking/borrow", data);
  return response.data;
}

export async function returnBook(bookingId: string): Promise<any> {
  const response = await api.post("/admin/booking/return", { bookingId });
  return response.data;
}

export async function extendBooking(data: ExtendFormData): Promise<any> {
  const response = await api.post("/admin/booking/extend", data);
  return response.data;
}

// History API functions
export async function getHistory(): Promise<any> {
  const response = await api.get(`/admin/history`);
  return response.data;
}

export async function getHistoryById(id: string): Promise<any> {
  const response = await api.get(`/admin/history/${id}`);
  return response.data;
}

export async function searchHistory(
  query: string,
  field: string,
  pageNumber: number = 1,
  pageSize: number = 10,
  sortDirection: "asc" | "desc" = "asc",
): Promise<any> {
  const res = await api.get("/api/admin/history/search", {
    params: {
      query,
      field,
      pageNumber,
      pageSize,
      sortDirection,
    },
  });

  return res.data;
}
