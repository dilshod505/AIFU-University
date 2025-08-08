"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../../../public/img-bg.png";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { baseBackendUrl } from "@/components/models/axios";
import useLayoutStore from "@/store/layout-store";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function Login() {
  const t = useTranslations();
  const router = useRouter();
  const { setCredentials, user } = useLayoutStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const res = await axios.post(`${baseBackendUrl}/api/admin/auth/login`, {
        email,
        password,
      });
      if (res.status === 200 && res.data?.data) {
        setCredentials(email, res?.data.data?.token || "");
        Cookies.set("aifu-token", res?.data.data?.token || "");
        toast.success(t("Login successfull"));
        router.replace(
          `/${res?.data.data?.user?.role.toString().toLowerCase().replace("_", "-")}/dashboard`,
        );
        setIsLoading(false);
      }
    } catch (e) {
      toast.error(t("Invalid credentials"));
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-32 flex items-center justify-center">
            <Image src={logo} alt={"logo"} priority quality={100} />
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
                className="h-11 border-gray-200 text-black bg-white"
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
                className="h-11 border-gray-200 text-black bg-white"
                required
              />
            </div>
            <div className="text-right">
              <Link
                href="/login/forget"
                className="text-sm text-[#FF0258] hover:underline"
              >
                {t("Forgot Password?")}
              </Link>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#FF0258] hover:bg-[#FF0258]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading && <LoaderCircle className={"animate-spin"} />}
              {t("Login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
