import { BookingFormData, ExtendFormData } from "@/types/booking";
import { api } from "@/components/models/axios"; // Booking API functions

// Booking API functions
export async function getBookings(): Promise<any> {
  const response = await api.get("/admin/booking");
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

export async function returnBook(bookingId: string): Promise<void> {
  const response = await api.post("/admin/booking/return", { bookingId });
  return response.data;
}

export async function extendBooking(data: ExtendFormData): Promise<void> {
  const response = await api.post("/admin/booking/extend", data);
  return response.data;
}

// History API functions
export async function getHistory(): Promise<any> {
  const response = await api.get("/admin/history");
  return response.data;
}

export async function getHistoryById(id: string): Promise<any> {
  const response = await api.get(`/admin/history/${id}`);
  return response.data;
}

export async function searchHistory(query: string, field: string) {
  const res = await api.get("/api/admin/history/search", {
    params: {
      query,
      field,
      pageNumber: 1,
      pageSize: 10,
      sortDirection: "asc",
    },
  });

  return res.data.data;
}
