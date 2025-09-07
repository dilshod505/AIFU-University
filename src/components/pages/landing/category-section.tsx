"use client";

import { Marquee } from "@/components/magicui/marquee";
import { TextAnimate } from "@/components/magicui/text-animate";
import { api } from "@/components/models/axios";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

export function CategorySection({
  setCategoryId,
}: {
  setCategoryId: Dispatch<SetStateAction<string | number>>;
}) {
  const t = useTranslations();

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/client/categories");
      return res.data;
    },
  });

  return (
    <section className="py-20">
      <div className="">
        <div className="cont text-center mb-16">
          <TextAnimate
            animation="blurInUp"
            as="h1"
            className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4"
          >
            {t("Explore by Category")}
          </TextAnimate>
          <TextAnimate
            animation="blurInUp"
            as="h1"
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t("Find your perfect book in our carefully curated categories")}
          </TextAnimate>
        </div>

        {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">*/}
        <Marquee pauseOnHover className="[--duration:20s]">
          {/*<Link href={"/books"}>*/}
          {/*  <Card className="group cursor-pointer border-2 hover:border-cyan-800 dark:hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm">*/}
          {/*    <CardContent className="px-8 py-4 min-w-60 flex items-center justify-center">*/}
          {/*      <div>*/}
          {/*        <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">*/}
          {/*          {t("All")}*/}
          {/*        </h3>*/}
          {/*        <p className="text-sm text-muted-foreground">*/}
          {/*          {t("books count")}: 0*/}
          {/*        </p>*/}
          {/*      </div>*/}
          {/*    </CardContent>*/}
          {/*  </Card>*/}
          {/*</Link>*/}
          {data?.data
            .slice(0, data?.data?.length / 2)
            .map((category: Record<string, any>) => {
              return (
                <Link key={category.id} href={`/books?category=${category.id}`}>
                  <Card className="group cursor-pointer border-2 hover:border-cyan-800 dark:hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm">
                    <CardContent className="px-8 py-4 min-w-60 flex items-center justify-center">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("books count")}: {category.bookCount}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {/*<Link href={"/books"}>*/}
          {/*  <Card className="group cursor-pointer border-2 hover:border-cyan-800 dark:hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm">*/}
          {/*    <CardContent className="px-8 py-4 min-w-60 flex items-center justify-center">*/}
          {/*      <div>*/}
          {/*        <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">*/}
          {/*          {t("All")}*/}
          {/*        </h3>*/}
          {/*        <p className="text-sm text-muted-foreground">*/}
          {/*          {t("books count")}: 0*/}
          {/*        </p>*/}
          {/*      </div>*/}
          {/*    </CardContent>*/}
          {/*  </Card>*/}
          {/*</Link>*/}
          {data?.data
            .slice(data?.data?.length / 2, data?.data?.length)
            .map((category: Record<string, any>) => {
              return (
                <Link key={category.id} href={`/books?category=${category.id}`}>
                  <Card className="group cursor-pointer border-2 hover:border-cyan-800 dark:hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm">
                    <CardContent className="px-8 py-4 min-w-60 flex items-center justify-center">
                      <div>
                        <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("books count")}: {category.bookCount}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </Marquee>
        {/*</div>*/}
      </div>
    </section>
  );
}
