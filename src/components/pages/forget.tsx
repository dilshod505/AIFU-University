"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../../../public/img-bg.png";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api, baseBackendUrl } from "@/components/models/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "verify";

export default function ForgetPassword() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const sentGmail = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);
      const emailValue = formData.get("email") as string;

      const res = await api.post(
        `${baseBackendUrl}/api/admin/password-reset/initiate`,
        {
          email: emailValue,
        },
      );

      if (res.status === 200) {
        setEmail(emailValue);
        setStep("verify");
        toast.success(t("Verification code sent to your email"));
      }
    } catch (error) {
      toast.error(t("Failed to send verification code"));
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("Passwords do not match"));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("Password must be at least 6 characters"));
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post(
        `${baseBackendUrl}/api/admin/password-reset/confirm`,
        {
          email,
          code,
          newPassword,
        },
      );

      if (res.status === 200) {
        toast.success(t("Password reset successful"));
        router.push("/login");
      }
    } catch (error) {
      toast.error(t("Invalid verification code or failed to reset password"));
    } finally {
      setIsLoading(false);
    }
  };

  const backToLogin = () => {
    setStep("email");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-32 flex items-center justify-center">
            <Image
              src={logo || "/placeholder.svg"}
              alt={"logo"}
              priority
              quality={100}
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("Reset Password")}
            </h1>
            <p className="text-sm text-gray-600">
              {step === "email"
                ? t("Enter your email to receive a verification code")
                : t("Enter the verification code and your new password")}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "email" ? (
            <form className="space-y-4" onSubmit={sentGmail}>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("Email Address")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="h-11 border-gray-200 text-black bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#FF0258] hover:bg-[#FF0258]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                {t("Send Verification Code")}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/login")}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {t("Back to Login")}
                </Button>
              </div>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={changePassword}>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t("Email")}
                </Label>
                <Input
                  value={email}
                  disabled
                  className="h-11 border-gray-200 text-black bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t("Verification Code")}
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("New Password")}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 border-gray-200 text-black bg-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("Confirm New Password")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 border-gray-200 text-black bg-white"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full h-11 bg-[#FF0258] hover:bg-[#FF0258]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                {t("Reset Password")}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={backToLogin}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t("Back to Email")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
