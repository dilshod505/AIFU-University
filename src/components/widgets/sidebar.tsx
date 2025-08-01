"use client";

import type React from "react";
import { useMemo, useState } from "react";
import {
  FolderOpen,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Search,
  ShoppingBasket,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Enhanced Types

// Enhanced Types
interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  isNew?: boolean;
  exactMatch?: boolean;
  children?: MenuItem[];
  activePatterns?: string[];
  group?: string;
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
      if (item.exactMatch) {
        return pathname === item.href;
      }
      if (pathname.includes(item.href)) {
        return true;
      }
      if (pathname.startsWith(item.href + "/")) {
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

const Sidebar: React.FC<SidebarProps> = ({
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
  const [searchQuery, setSearchQuery] = useState("");
  const { state } = useSidebar();
  const { isActive, getActiveLevel } = useActiveState(pathname);

  // Enhanced default menu items
  const defaultItems = useMemo<MenuItem[]>(
    () => [
      {
        title: t("Dashboard"),
        icon: <LayoutDashboard className="w-4 h-4" />,
        href: "/admin/dashboard",
        group: "main",
      },
      {
        title: t("Users"),
        icon: <Users className="w-4 h-4" />,
        href: "/admin/users",
        activePatterns: ["/admin/users/*"],
        group: "main",
      },
      {
        title: t("e-book category"),
        icon: <FolderOpen className="w-4 h-4" />,
        href: "/admin/categories/e-books",
        activePatterns: ["/admin/category/*"],
        group: "categories",
      },
      {
        title: t("regular book category"),
        icon: <FolderOpen className="w-4 h-4" />,
        href: "/admin/categories/base-books",
        activePatterns: ["/admin/category/*"],
        group: "categories",
      },
      {
        title: t("E-Base-Books"),
        icon: <FolderOpen className="w-4 h-4" />,
        href: "/admin/e-books",
        activePatterns: ["/admin/category/*"],
        group: "books",
      },
      {
        title: t("regular book"),
        icon: <LibraryBig className="w-4 h-4" />,
        href: "/admin/base-books",
        activePatterns: ["/admin/book/*", "/admin/library/*"],
        group: "books",
      },
      {
        title: t("book copies"),
        icon: <ShoppingBasket className="w-4 h-4" />,
        href: "/admin/copies-books",
        badge: notifications > 0 ? notifications : undefined,
        activePatterns: ["/admin/orders/*", "/admin/order/*"],
        group: "books",
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

  // Get active state for menu button
  const getMenuButtonProps = (item: MenuItem) => {
    const activeLevel = getActiveLevel(item);
    return {
      isActive: activeLevel === "exact" || activeLevel === "child",
      className: cn(
        activeLevel === "parent" && "bg-primary/10 text-primary",
        activeLevel === "child" &&
          "bg-green-600 text-white hover:bg-green-600/90",
      ),
    };
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem) => {
    const { isActive: itemIsActive, className: itemClassName } =
      getMenuButtonProps(item);

    // For collapsed state, show tooltip
    const menuButton = (
      <SidebarMenuButton
        asChild
        isActive={itemIsActive}
        className={itemClassName}
      >
        <Link href={item.href}>
          {item.icon}
          <span>{item.title}</span>
          {item.badge && (
            <Badge
              variant={itemIsActive ? "secondary" : "default"}
              className="ml-auto h-5 px-1.5 text-xs"
            >
              {item.badge}
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    );

    return (
      <SidebarMenuItem key={item.href}>
        {state === "collapsed" ? (
          <Tooltip>
            <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          menuButton
        )}
        {item.children && (
          <SidebarMenuSub>
            {item.children.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton asChild isActive={isActive(child)}>
                  <Link href={child.href}>
                    {child.icon}
                    <span>{child.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  // Handle logout
  const handleLogout = () => {
    onLogout?.();
  };

  return (
    <TooltipProvider>
      <SidebarPrimitive className={className} collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-center p-2">
            {state === "expanded" ? (
              <img src="/logo-full.png" alt="Logo" className="h-8 w-auto" />
            ) : (
              <img src="/logo-icon.png" alt="Logo" className="h-8 w-8" />
            )}
          </div>

          {/* User Profile Section */}
          {user && state === "expanded" && (
            <div className="px-2 pb-2">
              <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <Avatar className="h-8 w-8">
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

          {/* User Profile for Collapsed State */}
          {user && state === "collapsed" && (
            <div className="px-2 pb-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    {user.role && (
                      <p className="text-xs text-muted-foreground">
                        {user.role}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Search */}
          {showSearch && state === "expanded" && (
            <div className="px-2 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("Search menu") + "..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8"
                />
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          {searchQuery && state === "expanded" ? (
            // Show filtered results when searching
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => renderMenuItem(item))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t("No items found")}</p>
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
            // Show grouped navigation
            <>
              {Object.entries(groupedItems).map(([groupName, items]) => (
                <SidebarGroup key={groupName}>
                  {groupName !== "default" && state === "expanded" && (
                    <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t(groupName)}
                    </SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => renderMenuItem(item))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </>
          )}

          {/* Custom Children Content */}
          {children && (
            <>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupContent>{children}</SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        {/* Logout Section */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {state === "collapsed" ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{t("logout")}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>{t("logout")}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarPrimitive>
    </TooltipProvider>
  );
};

export default Sidebar;
