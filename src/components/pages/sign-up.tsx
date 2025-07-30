"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/components/models/axios";

const SignUp = () => {
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const surname = formData.get("surname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await api.post(
        "/auth/sing-up",
        {
          name,
          surname,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      );

      if (res.status === 200) {
        toast.success("Ro'yxatdan o'tish muvaffaqiyatli");
        router.push("/login");
      }
    } catch (err) {
      toast.error("Ro'yxatdan o'tishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <h2 className="text-2xl font-bold text-black">Ro'yxatdan o'tish</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm text-gray-800">
                Ism
              </Label>
              <Input
                id="name"
                name="name"
                required
                className="text-black bg-white border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="surname" className="text-sm text-gray-800">
                Familiya
              </Label>
              <Input
                id="surname"
                name="surname"
                required
                className="text-black bg-white border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-gray-800">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="text-black bg-white border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-gray-800">
                Parol
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="text-black bg-white border-gray-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#FF0258] hover:bg-[#FF0258]/90 text-white font-medium shadow-lg"
            >
              Ro‘yxatdan o‘tish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
