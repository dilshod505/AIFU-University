import AntdProvider from "@/providers/antd-provider";
import ReactQueryProvider from "@/providers/react-query-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Mulish } from "next/font/google";
import "./globals.css";
import React from "react";

const mulish = Mulish({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "700", "500"],
  variable: "--font-noto-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${mulish.className} antialiased`}
      >
        <NextIntlClientProvider locale={locale}>
          {/*<HydrationLoader>*/}
          <ReactQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              themes={["light", "dark"]}
            >
              <AntdProvider>{children}</AntdProvider>
            </ThemeProvider>
          </ReactQueryProvider>
          {/*</HydrationLoader>*/}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
