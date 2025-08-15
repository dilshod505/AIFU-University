"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/components/models/axios";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction } from "react";

export function CategorySection({
  setCategoryId,
}: {
  setCategoryId: Dispatch<SetStateAction<string | number>>;
}) {
  const t = useTranslations();

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/client/categories");
      return res.data;
    },
  });

  return (
    <section className="py-20 bg-background ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            {t("Explore by Category")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("Find your perfect book in our carefully curated categories")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.data.map((category: Record<string, any>) => {
            return (
              <Card
                onClick={() => setCategoryId(category.id)}
                key={category.name}
                className="group cursor-pointer border-2 hover:border-cyan-800 dark:hover:border-cyan-300 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div
                      className={`p-3 ${category.color} rounded-xl mr-4 group-hover:scale-110 transition-transform duration-200`}
                    ></div>
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-cyan-800 dark:group-hover:text-cyan-300 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.bookCount} books
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
