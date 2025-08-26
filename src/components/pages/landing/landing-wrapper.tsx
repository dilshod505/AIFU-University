"use client";

import { BookGrid } from "@/components/pages/landing/book-grid";
import { CategorySection } from "@/components/pages/landing/category-section";
import { FeaturedBooks } from "@/components/pages/landing/featured-books";
import Footer from "@/components/pages/landing/footer";
import { HeroSection } from "@/components/pages/landing/hero-section";
import { ShopByCategory } from "@/components/pages/landing/show-by-categories";
import TopBtn from "@/components/widgets/top-btn";
import { useState } from "react";

const LandingWrapper = () => {
  const [categoryId, setCategoryId] = useState<string | number>();
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <FeaturedBooks />
        <CategorySection setCategoryId={setCategoryId as any} />
        <BookGrid categoryId={categoryId} />
        <ShopByCategory />
        <Footer />
        <TopBtn />
      </main>
    </div>
  );
};

export default LandingWrapper;
