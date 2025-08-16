"use client";

import React, { useState } from "react";
import { HeroSection } from "@/components/pages/landing/hero-section";
import { CategorySection } from "@/components/pages/landing/category-section";
import { BookGrid } from "@/components/pages/landing/book-grid";
import { FeaturedBooks } from "@/components/pages/landing/featured-books";
import Footer from "@/components/pages/landing/footer";

const LandingWrapper = () => {
  const [categoryId, setCategoryId] = useState<string | number>();
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        {/*@ts-ignore*/}
        <FeaturedBooks />
        <CategorySection setCategoryId={setCategoryId as any} />
        <BookGrid categoryId={categoryId} />
        <Footer />
      </main>
    </div>
  );
};

export default LandingWrapper;
