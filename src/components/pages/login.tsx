import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function Login() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">AIFU</h1>
            <div className="w-12 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email and Password Form */}
          <form className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Create Account
            </Button>
          </form>

          {/* Additional Links */}
          <div className="flex justify-center space-x-4 text-xs">
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              Terms
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              Privacy
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="#"
              className="text-gray-500 hover:text-purple-600 transition-colors"
            >
              Help
            </a>
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {/* Trust Indicators */}
          <div className="w-full text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>We respect your privacy</span>
            </div>
            <p className="text-xs text-gray-400">
              No spam, unsubscribe at any time
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
