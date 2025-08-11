export interface Booking {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  userName: string;
  userEmail: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "borrowed" | "returned" | "overdue";
  extendedCount: number;
}

export interface BookingFormData {
  bookId: string;
  userId: string;
  dueDate: string;
}

export interface ExtendFormData {
  bookingId: string;
  newDueDate: string;
}
