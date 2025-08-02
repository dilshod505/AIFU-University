"use client";

import type React from "react";
import { useMemo } from "react";
import {
  Bell,
  Calendar,
  ChevronDown,
  FolderOpen,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Users,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button"; // Enhanced Types

// Enhanced Types
interface MenuItem {
  title: string;
  icon?: React.ReactNode;
  href: string;
  badge?: number | string;
  isNew?: boolean;
  exactMatch?: boolean;
  children?: MenuItem[];
  activePatterns?: string[];
}

interface OptimizedSidebarProps {
  notifications?: number;
  onLogout?: () => void;
  customMenuItems?: MenuItem[];
  className?: string;
  children?: React.ReactNode;
}

// Enhanced Active Logic Hook
const useActiveState = (pathname: string) => {
  const isActive = useMemo(() => {
    return (item: MenuItem): boolean => {
      if (item.exactMatch) {
        return pathname === item.href;
      }
      if (pathname === item.href) {
        return true;
      }
      if (item.activePatterns) {
        return item.activePatterns.some((pattern) => {
          if (pattern.includes("*")) {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(pathname);
          }
          return pathname.includes(pattern);
        });
      }
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

const OptimizedSidebar: React.FC<OptimizedSidebarProps> = ({
  notifications = 0,
  onLogout,
  customMenuItems = [],
  className,
  children,
}) => {
  const t = useTranslations();
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const { isActive, getActiveLevel } = useActiveState(pathname);
  const isCollapsed = state === "collapsed";

  // Enhanced default menu items with nested structure
  const defaultItems = useMemo<MenuItem[]>(
    () => [
      {
        title: t("Dashboard"),
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/admin/dashboard",
      },
      {
        title: t("categories"),
        icon: <FolderOpen className="w-5 h-5" />,
        href: "/admin/categories",
        children: [
          {
            title: t("E-Books category"),
            href: "/admin/categories/e-books",
            activePatterns: [
              "/admin/categories/e-books",
              "/admin/category/e-books/*",
            ],
          },
          {
            title: t("regular book category"),
            href: "/admin/categories/base-books",
            activePatterns: [
              "/admin/categories/base-books",
              "/admin/category/base-books/*",
            ],
          },
        ],
      },
      {
        title: t("Books"),
        icon: <LibraryBig className="w-5 h-5" />,
        href: "/admin/books",
        children: [
          {
            title: t("E-Books"),
            href: "/admin/e-books",
            activePatterns: ["/admin/e-books", "/admin/e-books/*"],
          },
          {
            title: t("regular book"),
            href: "/admin/base-books",
            activePatterns: ["/admin/base-books", "/admin/base-books/*"],
          },
          {
            title: t("Copies books"),
            href: "/admin/copies-books",
            badge: notifications > 0 ? notifications : undefined,
            activePatterns: [
              "/admin/copies-books",
              "/admin/orders/*",
              "/admin/order/*",
            ],
          },
        ],
      },
      {
        title: t("Users"),
        icon: <Users className="w-5 h-5" />,
        href: "/admin/users",
        activePatterns: ["/admin/users", "/admin/users/*"],
      },
      {
        title: t("Bookings"),
        icon: <Calendar className="w-5 h-5" />,
        href: "/admin/bookings",
        activePatterns: ["/admin/bookings", "/admin/bookings/*"],
      },
      {
        title: t("Notifications"),
        icon: <Bell className="w-5 h-5" />,
        href: "/admin/notifications",
        activePatterns: ["/admin/notifications", "/admin/notifications/*"],
      },
    ],
    [t, notifications],
  );

  // Combine all menu items
  const allItems = useMemo(
    () => [...defaultItems, ...customMenuItems],
    [defaultItems, customMenuItems],
  );

  // Render menu item with children
  const renderMenuItem = (item: MenuItem) => {
    const itemIsActive = isActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive =
      getActiveLevel(item) === "parent" || getActiveLevel(item) === "exact";
    const activeLevel = getActiveLevel(item);

    // Common classes for menu items
    const getMenuItemClasses = (isActive: boolean, isParent = false) => {
      return cn(
        "flex items-center gap-2 h-10 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
        // Collapsed state - center icons and adjust padding
        isCollapsed ? "justify-center px-3" : "px-4",
        // Default inactive state
        "text-muted-foreground hover:bg-green-600/95 hover:text-white",
        // Active states
        isActive && "bg-green-600 text-white hover:bg-green-700",
        // Parent active state (subtle background when child is active)
        isParent &&
          !isActive &&
          "bg-green-600/10 text-green-700 hover:bg-green-600/20 hover:text-green-600",
      );
    };

    const menuContent = (
      <>
        {item.icon && (
          <span className={cn("flex-shrink-0", isCollapsed && "mx-auto")}>
            {item.icon}
          </span>
        )}
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate text-start">{item.title}</span>
            {item.badge && (
              <Badge
                variant={itemIsActive ? "secondary" : "default"}
                className={cn(
                  "ml-auto h-5 px-1.5 text-xs",
                  itemIsActive && "bg-white text-green-600",
                )}
              >
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  isParentActive && "rotate-180",
                )}
              />
            )}
          </>
        )}
      </>
    );

    // For collapsed state, wrap everything in tooltip
    if (isCollapsed) {
      const content = hasChildren ? (
        <button
          className={getMenuItemClasses(
            activeLevel === "exact" || activeLevel === "child",
            activeLevel === "parent",
          )}
          onClick={() => {
            // In collapsed state, clicking parent items could expand sidebar or navigate
            if (!hasChildren) {
              window.location.href = item.href;
            }
          }}
        >
          {menuContent}
        </button>
      ) : (
        <Link href={item.href} className={getMenuItemClasses(itemIsActive)}>
          {menuContent}
        </Link>
      );

      return (
        <div key={item.href} className="relative group/menu-item">
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <div>
                <p className="font-semibold">{item.title}</p>
                {hasChildren && item.children && (
                  <div className="mt-1 space-y-1">
                    {item.children.map((child) => (
                      <p key={child.href} className="text-xs opacity-75">
                        • {child.title}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }

    // Expanded state logic
    const mainLinkOrTrigger = hasChildren ? (
      <CollapsibleTrigger
        className={cn(
          "w-full",
          getMenuItemClasses(
            activeLevel === "exact" || activeLevel === "child",
            activeLevel === "parent",
          ),
        )}
      >
        {menuContent}
      </CollapsibleTrigger>
    ) : (
      <Link
        href={item.href}
        className={cn("w-full", getMenuItemClasses(itemIsActive))}
      >
        {menuContent}
      </Link>
    );

    return (
      <div key={item.href} className="relative group/menu-item">
        {hasChildren ? (
          <Collapsible
            defaultOpen={isParentActive}
            className="group/collapsible w-full"
          >
            {mainLinkOrTrigger}
            <CollapsibleContent>
              <div className="flex flex-col gap-1 mt-1 ml-6 pl-2 border-l border-gray-200">
                {item.children?.map((child) => (
                  <div key={child.href} className="relative">
                    <Link
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        "text-muted-foreground hover:bg-green-600/50 hover:text-white",
                        isActive(child) &&
                          "bg-green-600 text-white hover:bg-green-700",
                      )}
                    >
                      <span className="w-1.5 h-1.5 bg-current rounded-full flex-shrink-0" />
                      <span className="flex-1">{child.title}</span>
                      {child.badge && (
                        <Badge
                          variant={isActive(child) ? "secondary" : "default"}
                          className={cn(
                            "ml-auto h-5 px-1.5 text-xs",
                            isActive(child) && "bg-white text-green-600",
                          )}
                        >
                          {child.badge}
                        </Badge>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          mainLinkOrTrigger
        )}
      </div>
    );
  };

  // Handle logout
  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <TooltipProvider>
      <Sidebar
        className={cn(
          "border-r bg-white transition-all duration-300",
          isCollapsed ? "w-20" : "w-64",
          className,
        )}
        collapsible="icon"
      >
        <SidebarHeader>
          <div
            className={cn(
              "flex items-center w-full py-4 transition-all duration-300",
              isCollapsed ? "justify-center px-3" : "justify-between px-4",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 transition-all duration-300",
                isCollapsed && "justify-center",
              )}
            >
              <LibraryBig className="w-6 h-6 text-primary flex-shrink-0" />
              {!isCollapsed && (
                <h1 className="text-xl font-bold">AIFU Library</h1>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleSidebar}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close Sidebar</span>
              </Button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-1">
              {allItems.map((item) => renderMenuItem(item))}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Custom Children Content - hide in collapsed state */}
          {children && !isCollapsed && (
            <SidebarGroup>
              <SidebarGroupContent className="flex flex-col gap-1">
                {children}
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Logout Section */}
        <SidebarFooter>
          <div
            className={cn(
              "mb-3 transition-all duration-300",
              isCollapsed && "px-3 py-4",
            )}
          >
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full h-10 px-3 py-2.5 rounded-lg justify-center text-muted-foreground hover:text-white hover:bg-green-600/95"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{t("logout")}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-2 h-10 px-4 py-2.5 rounded-lg text-muted-foreground hover:text-white hover:bg-green-600/95"
              >
                <LogOut className="w-5 h-5" />
                <span>{t("logout")}</span>
              </Button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
};

export default OptimizedSidebar;
