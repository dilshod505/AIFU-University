import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { HeroSection } from "@/components/pages/landing/hero-section";
import { CategorySection } from "@/components/pages/landing/category-section";
import { BookGrid } from "@/components/pages/landing/book-grid";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return {
    title: "AIFU University",
    description: t(
      `Aniq va ijtimoiy fanlar universitetining kutubxona bo'limi`,
    ),
  };
};

const Page = async () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <CategorySection />
        {/*<FeaturedBooks />*/}
        <BookGrid />
      </main>
    </div>
  );
};

export default Page;
