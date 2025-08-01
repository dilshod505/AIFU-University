"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../../../public/logo.png";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "@/components/models/axios";
import useLayoutStore from "@/store/layout-store";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link"; // 🔴 Yangi import

export default function Login() {
  const t = useTranslations();
  const router = useRouter();
  const { setCredentials } = useLayoutStore();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const res = await api.post("/auth/login", { email, password });
      if (res.status === 200 && res.data?.data) {
        setCredentials(email, res?.data.data || "");
        Cookies.set("aifu-token", res?.data.data || "");
        toast.success(t("Login successfull"));
        router.replace("/");
      }
    } catch (e) {
      toast.error(t("Invalid credentials"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-32 bg-stone-300 flex items-center justify-center">
            <Image src={logo} alt={"logo"} priority />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email and Password Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                {t("email")}
              </Label>
              <Input
                id="email"
                name={"email"}
                type="text"
                placeholder="Enter your email address"
                className="h-11 border-gray-200 text-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                {t("Password")}
              </Label>
              <Input
                id="password"
                name={"password"}
                type="password"
                placeholder="Create a password"
                className="h-11 border-gray-200 text-background"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#FF0258] hover:bg-[#FF0258]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {t("Login")}
            </Button>
          </form>

          {/* 🔽 SIGN UP LINK SHU YERDA */}
          <div className="text-center text-sm text-gray-600 pt-4">
            {t("Don't have an account?")}{" "}
            <Link
              href="/sign-up"
              className="text-[#FF0258] hover:underline font-medium"
            >
              {t("Sign up")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
