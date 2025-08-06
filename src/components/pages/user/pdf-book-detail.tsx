"use client";

import React from "react";
import { usePdfBookId } from "@/components/models/queries/pdf-books";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Building,
  Calendar,
  Download,
  FileText,
  Globe,
  Hash,
  Layers,
  User,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const PdfBookDetail = () => {
  const t = useTranslations();
  const { id } = useParams();
  const { data: book } = usePdfBookId({ id: id?.toString() || "" });

  return book ? (
    <div className="min-h-screen ">
      <div className="cont mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Book Cover Section */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden border-green-200 shadow-xl">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=600&width=400"
                    alt={book?.data?.title}
                    width={400}
                    height={600}
                    className="w-full max-h-[400px] h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 hover:bg-green-700">
                      {book?.data?.categoryPreview.name}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-t from-green-600 to-emerald-500 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">
                        {book?.data?.pageCount} sahifa
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span className="text-sm">{book?.data?.size} MB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Kitobni O'qish
              </Button>
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                <Download className="mr-2 h-4 w-4" />
                PDF Yuklab Olish
              </Button>
            </div>
          </div>

          {/* Book Details Section */}
          <div className="lg:col-span-2 space-y-6 h-full">
            {/* Title and Author */}
            <Card>
              <CardContent>
                <div className="grid grid-cols-2">
                  <div className="space-y-4 col-span-1">
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {book?.data?.title}
                      </h1>
                      <div className="flex items-center gap-2 text-green-600">
                        <User className="h-5 w-5" />
                        <span className="text-xl font-medium">
                          {book?.data?.author}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-lg leading-relaxed">
                      {book?.data?.description}
                    </p>
                  </div>
                  <div className="col-span-1 space-y-4">
                    <div className="">
                      <div className="flex items-center gap-3 mb-3">
                        <Hash className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">ISBN</h3>
                      </div>
                      <div className="text-sm">
                        <span className="font-mono bg-green-50 px-2 py-1 rounded text-green-800">
                          {book?.data?.isbn}
                        </span>
                      </div>
                    </div>
                    <div className="">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">
                          Kategoriya
                        </h3>
                      </div>
                      <div className="text-sm">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {book?.data?.categoryPreview.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Information Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Nashr Ma'lumotlari
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nashr yili:</span>
                      <span className="font-medium">
                        {book?.data?.publicationYear}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nashriyot:</span>
                      <span className="font-medium">
                        {book?.data?.publisher}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sana:</span>
                      <span className="font-medium">
                        {book?.data?.localDate}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">
                      Til va Format
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Til:</span>
                      <span className="font-medium">
                        {book?.data?.language}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yozuv:</span>
                      <span className="font-medium">{book?.data?.script}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sahifalar:</span>
                      <span className="font-medium">
                        {book?.data?.pageCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* About Section */}
            <Card className="border-green-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Kitob Haqida
                </h3>
                <div className="prose prose-green max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {book?.data?.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="absolute bg-white top-0 left-0 z-50 flex justify-center items-center h-screen w-full gap-3  ">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      <p className="ml-2 text-black">{t("loading")}...</p>
    </div>
  );
};

export default PdfBookDetail;
