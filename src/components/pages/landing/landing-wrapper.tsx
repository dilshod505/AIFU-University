"use client";

import React, { useState } from "react";
import { HeroSection } from "@/components/pages/landing/hero-section";
import { CategorySection } from "@/components/pages/landing/category-section";
import { BookGrid } from "@/components/pages/landing/book-grid";

const LandingWrapper = () => {
  const [categoryId, setCategoryId] = useState<string | number>();
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        {/*@ts-ignore*/}
        <CategorySection setCategoryId={setCategoryId} />
        <BookGrid categoryId={categoryId} />
      </main>
    </div>
  );
};

export default LandingWrapper;
