"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingFormData } from "@/types/booking";
import { useBorrowBook } from "@/hooks/use-bookings";

export function BorrowBookForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    bookId: "",
    userId: "",
    dueDate: "",
  });

  const borrowBookMutation = useBorrowBook();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await borrowBookMutation.mutateAsync(formData);
      // Reset form on success
      setFormData({ bookId: "", userId: "", dueDate: "" });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kitob berish</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookId">Kitob ID</Label>
            <Input
              id="bookId"
              value={formData.bookId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bookId: e.target.value }))
              }
              placeholder="Kitob ID ni kiriting"
              required
              disabled={borrowBookMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">Foydalanuvchi ID</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userId: e.target.value }))
              }
              placeholder="Foydalanuvchi ID ni kiriting"
              required
              disabled={borrowBookMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Qaytarish sanasi</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              required
              disabled={borrowBookMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            disabled={borrowBookMutation.isPending}
            className="w-full"
          >
            {borrowBookMutation.isPending ? "Saqlanmoqda..." : "Kitob berish"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
