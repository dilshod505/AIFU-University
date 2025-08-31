"use client";

import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="cont">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-cyan-800 dark:text-cyan-300">
              BookHaven
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
            >
              Fiction
            </a>
            <a
              href="#"
              className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
            >
              Non-Fiction
            </a>
            <a
              href="#"
              className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
            >
              Young Adult
            </a>
            <a
              href="#"
              className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
            >
              Mystery
            </a>
            <a
              href="#"
              className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors"
            >
              Romance
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search books, authors, genres..."
                className="pl-10 bg-muted/50 border-border focus:border-cyan-800 dark:focus:border-cyan-300"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search books..."
                  className="pl-10 bg-muted/50"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <a
                  href="#"
                  className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 py-2"
                >
                  Fiction
                </a>
                <a
                  href="#"
                  className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 py-2"
                >
                  Non-Fiction
                </a>
                <a
                  href="#"
                  className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 py-2"
                >
                  Young Adult
                </a>
                <a
                  href="#"
                  className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 py-2"
                >
                  Mystery
                </a>
                <a
                  href="#"
                  className="text-foreground hover:text-cyan-800 dark:hover:text-cyan-300 py-2"
                >
                  Romance
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
