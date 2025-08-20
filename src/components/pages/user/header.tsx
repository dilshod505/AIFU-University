"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import logo from "../../../../public/logo-full.png";
import FullScreen from "@/components/widgets/full-screen";
import ThemeSwitcher from "@/components/widgets/theme-switcher";
import ChangeLanguage from "@/components/widgets/change-language";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen, Search } from "lucide-react";
import { api } from "@/components/models/axios";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
}

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useQuery<Record<string, any>[]>({
    queryKey: ["books", searchQuery],
    queryFn: async () => {
      const res = await api.get<Record<string, any>[]>(
        `/client/search?query=${searchQuery}`,
      );
      return res.data || [];
    },
    enabled: searchQuery.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data: Record<string, any>) => data?.data,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#213148] sticky top-0 z-50 py-3">
      <header className="cont flex h-16 shrink-0 justify-between items-center gap-2 px-4 ">
        <div className="flex justify-center items-center gap-3">
          <Link href="/">
            <h1 className={`text-2xl font-semibold py-5`}>
              <Image src={logo || "/placeholder.svg"} alt={""} />
            </h1>
          </Link>
        </div>

        <div className="search relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Kitoblarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className="pl-12 pr-4 py-3 w-[30vw] h-12 rounded-3xl bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 focus:border-white/40"
            />
          </div>

          {isSearchOpen &&
            // @ts-ignore
            (searchQuery.length > 0 || searchResults?.length > 0) && (
              <Card className="absolute hide-scroll py-0 top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2">Qidirilmoqda...</p>
                  </div>
                ) : searchResults && searchResults?.length > 0 ? (
                  <div className="py-2">
                    {searchResults?.map((book) => (
                      <Link href={`/books/${book.id}`} key={book.id}>
                        <div
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {book.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {book.author}
                              </p>
                              {book.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {book.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.length > 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Hech qanday kitob topilmadi</p>
                    <p className="text-sm mt-1">
                      "{searchQuery}" uchun natija yo'q
                    </p>
                  </div>
                ) : null}
              </Card>
            )}
        </div>

        <div className="flex justify-center items-center gap-2 text-white">
          <ThemeSwitcher />
          <ChangeLanguage />
        </div>
      </header>
    </div>
  );
};

export default Header;
