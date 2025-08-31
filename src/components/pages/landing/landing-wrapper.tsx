"use client";

import TopBtn from "@/components/widgets/top-btn";
import { useState } from "react";
import { BookGrid } from "./book-grid";
import { CategorySection } from "./category-section";
import { FeaturedBooks } from "./featured-books";
import Footer from "./footer";
import { HeroSection } from "./hero-section";
import { ShopByCategory } from "./show-by-categories";

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
