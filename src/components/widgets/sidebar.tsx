"use client";

import type React from "react";
import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FolderOpen,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Search,
  ShoppingBasket,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button"; // Enhanced Types

// Enhanced Types
interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  isNew?: boolean;
  exactMatch?: boolean; // Exact path matching
  children?: MenuItem[]; // Nested menu items
  activePatterns?: string[]; // Additional patterns to match
  group?: string; // Menu group
}

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface SidebarProps {
  children?: React.ReactNode;
  user?: UserInfo;
  notifications?: number;
  onLogout?: () => void;
  customMenuItems?: MenuItem[];
  showSearch?: boolean;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

// Enhanced Active Logic Hook
const useActiveState = (pathname: string) => {
  const isActive = useMemo(() => {
    return (item: MenuItem): boolean => {
      // Exact match check
      if (item.exactMatch) {
        return pathname === item.href;
      }

      // Check main href
      if (pathname.includes(item.href)) {
        return true;
      }

      // Check if current path starts with item href (for nested routes)
      if (pathname.startsWith(item.href + "/")) {
        return true;
      }

      // Check additional active patterns
      if (item.activePatterns) {
        return item.activePatterns.some((pattern) => {
          if (pattern.includes("*")) {
            // Wildcard matching
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(pathname);
          }
          return pathname.includes(pattern);
        });
      }

      // Check children for nested active state
      if (item.children) {
        return item.children.some((child) => isActive(child));
      }

      return false;
    };
  }, [pathname]);

  const isParentActive = useMemo(() => {
    return (item: MenuItem): boolean => {
      if (!item.children) return false;
      return item.children.some((child) => isActive(child));
    };
  }, [isActive]);

  const getActiveLevel = useMemo(() => {
    return (item: MenuItem): "exact" | "parent" | "child" | "none" => {
      if (pathname === item.href) return "exact";
      if (isParentActive(item)) return "parent";
      if (isActive(item)) return "child";
      return "none";
    };
  }, [pathname, isActive, isParentActive]);

  return { isActive, isParentActive, getActiveLevel };
};

const OptimizedSidebar: React.FC<SidebarProps> = ({
  children,
  user,
  notifications = 0,
  onLogout,
  customMenuItems = [],
  showSearch = true,
  className,
  activeClassName,
  inactiveClassName,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isActive, isParentActive, getActiveLevel } = useActiveState(pathname);

  // Enhanced default menu items with active patterns
  const defaultItems = useMemo<MenuItem[]>(
    () => [
      {
        title: t("Dashboard"),
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/admin/dashboard",
        group: "main",
      },
      {
        title: t("Users"),
        icon: <Users className="w-5 h-5" />,
        href: "/admin/users",
        activePatterns: ["/admin/users/*"], // Additional patterns
        group: "main",
      },
      {
        title: t("E-BaseBooks category"),
        icon: <FolderOpen className="w-5 h-5" />,
        href: "/admin/categories/e-books",
        activePatterns: ["/admin/category/*"],
        group: "categories",
      },
      {
        title: t("regular book category"),
        icon: <FolderOpen className="w-5 h-5" />,
        href: "/admin/categories/base-books",
        activePatterns: ["/admin/category/*"],
        group: "categories",
      },
      {
        title: t("E-BaseBooks"),
        icon: <FolderOpen className="w-5 h-5" />,
        href: "/admin/e-base-books",
        activePatterns: ["/admin/category/*"],
        group: "base-base-books",
      },
      {
        title: t("regular book"),
        icon: <LibraryBig className="w-5 h-5" />,
        href: "/admin/base-books",
        activePatterns: ["/admin/book/*", "/admin/library/*"],
        group: "base-books",
      },
      {
        title: t("book copies"),
        icon: <ShoppingBasket className="w-5 h-5" />,
        href: "/admin/copies-books",
        badge: notifications > 0 ? notifications : undefined,
        activePatterns: ["/admin/orders/*", "/admin/order/*"],
        group: "base-base-books",
      },
    ],
    [t, notifications],
  );

  // Combine and group menu items
  const allItems = useMemo(
    () => [...defaultItems, ...customMenuItems],
    [defaultItems, customMenuItems],
  );

  // Group items by group property
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    allItems.forEach((item) => {
      const group = item.group || "default";
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [allItems]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    return allItems.filter((item) => {
      const matchesTitle = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesChildren = item.children?.some((child) =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return matchesTitle || matchesChildren;
    });
  }, [allItems, searchQuery]);

  // Get active state classes
  const getActiveClasses = (item: MenuItem) => {
    const activeLevel = getActiveLevel(item);
    const baseClasses =
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative";

    switch (activeLevel) {
      case "exact":
        return cn(
          baseClasses,
          activeClassName ||
            "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 transform scale-[1.02]",
        );
      case "parent":
        return cn(
          baseClasses,
          "bg-primary/10 text-primary border border-primary/20 shadow-sm",
          "hover:bg-primary/20",
        );
      case "child":
        return cn(
          baseClasses,
          "bg-green-600 text-white border border-green-500/20",
          "hover:bg-green-600/90 hover:text-white",
        );
      default:
        return cn(
          baseClasses,
          inactiveClassName ||
            "text-muted-foreground hover:text-foreground hover:bg-green-500/50",
        );
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  // Handle link click
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // Render menu item with children
  const renderMenuItem = (item: MenuItem, level = 0, index: number) => {
    const hasActiveChild =
      item.children && item.children.some((child) => isActive(child));

    return (
      <div key={index} className={cn(level > 0 && "ml-4")}>
        <Link
          href={item.href}
          onClick={handleLinkClick}
          className={getActiveClasses(item)}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span className="flex-1 truncate">{item.title}</span>

          {/* Active indicator */}
          {isActive(item) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
          )}

          {/* Badge */}
          {item.badge && (
            <Badge
              variant={isActive(item) ? "secondary" : "default"}
              className={cn(
                "h-5 px-1.5 text-xs",
                isActive(item) && "bg-primary-foreground text-primary",
              )}
            >
              {item.badge}
            </Badge>
          )}

          {/* New indicator */}
          {item.isNew && (
            <div className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          )}

          {/* Parent active indicator */}
          {hasActiveChild && !isActive(item) && (
            <div className="w-2 h-2 bg-primary/60 rounded-full" />
          )}
        </Link>

        {/* Render children if parent is active */}
        {item.children && (hasActiveChild || isActive(item)) && (
          <div className="mt-1 space-y-1 border-l-2 border-primary/20 ml-6 pl-2">
            {item.children.map((child, index: number) =>
              renderMenuItem(child, level + 1, index),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Menu className="w-6 h-6" />
          {notifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {notifications > 99 ? "99+" : notifications}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">{t("menu")}</SheetTitle>
          </div>
          <SheetDescription className="hidden" />
        </SheetHeader>

        {/* User Profile Section */}
        {user && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                {user.role && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {user.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        {showSearch && (
          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Search menu") + "..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 px-6 pb-4 overflow-y-auto">
          {searchQuery ? (
            // Show filtered results when searching
            <div className="space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item: MenuItem, i: number) =>
                  renderMenuItem(item, undefined, i),
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t("No items found")}</p>
                </div>
              )}
            </div>
          ) : (
            // Show grouped navigation
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="space-y-1">
                  {groupName !== "default" && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                      {t(groupName)}
                    </p>
                  )}
                  {items.map((item, i: number) =>
                    renderMenuItem(item, undefined, i),
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Custom Children Content */}
          {children && (
            <>
              <Separator className="my-4" />
              <div className="space-y-1">{children}</div>
            </>
          )}

          {/* Quick Actions */}
        </div>

        {/* Logout Section */}
        <div className="p-6 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <LogOut className="w-5 h-5" />
            <span>{t("logout")}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OptimizedSidebar;
