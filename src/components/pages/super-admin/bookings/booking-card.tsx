import { Book, Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/booking";
import { useExtendBooking, useReturnBook } from "@/hooks/use-bookings";

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (id: string) => void;
}

export function BookingCard({ booking, onViewDetails }: BookingCardProps) {
  const returnBookMutation = useReturnBook();
  const extendBookingMutation = useExtendBooking();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "borrowed":
        return "bg-blue-100 text-blue-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "borrowed":
        return "Olingan";
      case "returned":
        return "Qaytarilgan";
      case "overdue":
        return "Muddati o'tgan";
      default:
        return status;
    }
  };

  const handleReturn = () => {
    returnBookMutation.mutate(booking.id);
  };

  const handleExtend = () => {
    const newDueDate = new Date();
    newDueDate.setDate(newDueDate.getDate() + 7);

    extendBookingMutation.mutate({
      bookingId: booking.id,
      newDueDate: newDueDate.toISOString().split("T")[0],
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{booking.bookTitle}</CardTitle>
          <Badge className={getStatusColor(booking.status)}>
            {getStatusText(booking.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Book className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Muallif:</span>
            <span>{booking.bookAuthor}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Foydalanuvchi:</span>
            <span>{booking.userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Olingan sana:</span>
            <span>
              {new Date(booking.borrowDate).toLocaleDateString("uz-UZ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Qaytarish sanasi:</span>
            <span>{new Date(booking.dueDate).toLocaleDateString("uz-UZ")}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(booking.id)}
          >
            Batafsil
          </Button>
          {booking.status === "borrowed" && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleReturn}
                disabled={returnBookMutation.isPending}
              >
                {returnBookMutation.isPending
                  ? "Qaytarilmoqda..."
                  : "Qaytarish"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExtend}
                disabled={extendBookingMutation.isPending}
              >
                {extendBookingMutation.isPending
                  ? "Uzaytirilmoqda..."
                  : "Uzaytirish"}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
