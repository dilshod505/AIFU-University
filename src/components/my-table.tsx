"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  EyeOff,
  Filter,
  Maximize2,
  Minimize2,
  Pin,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardHeader } from "./ui/card";
import Checkbox from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import TooltipBtn from "@/components/tooltip-btn";
import { Skeleton } from "@/components/ui/skeleton";

export interface IColumn {
  key?: string;
  dataIndex?: string | string[];
  title: string | (() => ReactNode);
  width?: number | string;
  render?: (value: any, record: any, index: number) => ReactNode;
  sorter?: boolean | ((a: any, b: any) => number);
  filters?: { text: string; value: any }[];
  filterDropdown?: ReactNode;
  fixed?: "left" | "right";
  align?: "left" | "center" | "right";
  ellipsis?: boolean;
  hidden?: boolean;
  resizable?: boolean;
  copyable?: boolean;
  searchable?: boolean;
  tooltip?: string | ((value: any, record: any) => string);
  icon?: ReactNode;
}

export interface IPagination {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  onChange?: (page: number, pageSize: number) => void;
  pageSizeOptions?: string[];
  hideOnSinglePage?: boolean;
}

export interface IRowSelection {
  type?: "checkbox" | "radio";
  selectedRowKeys?: (string | number)[];
  onChange?: (
    selectedRowKeys: (string | number)[],
    selectedRows: any[],
  ) => void;
  onSelect?: (record: any, selected: boolean, selectedRows: any[]) => void;
  onSelectAll?: (
    selected: boolean,
    selectedRows: any[],
    changeRows: any[],
  ) => void;
  getCheckboxProps?: (record: any) => { disabled?: boolean };
  preserveSelectedRowKeys?: boolean;
  hideSelectAll?: boolean;
}

export interface IMyTableProps {
  className?: string;
  columns: IColumn[];
  dataSource: any[];
  rowKey?: string | ((record: any) => string);
  header?: ReactNode;
  bodyClassName?: string;
  pagination?: IPagination | false;
  rowSelection?: IRowSelection;
  expandable?: {
    expandedRowRender?: (record: any, index: number) => ReactNode;
    expandRowByClick?: boolean;
    defaultExpandAllRows?: boolean;
    expandedRowKeys?: (string | number)[];
    onExpand?: (expanded: boolean, record: any) => void;
    onExpandedRowsChange?: (expandedRows: (string | number)[]) => void;
  };
  scroll?: { x?: number | string; y?: number | string };
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  showHeader?: boolean;
  title?: ReactNode;
  footer?: ReactNode;
  rowClassName?: (record: any, index: number) => string;
  onRow?: (
    record: any,
    index: number,
  ) => {
    onClick?: () => void;
    onDoubleClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };
  sticky?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  columnVisibility?: boolean;
  // Enhanced features
  striped?: boolean;
  hoverable?: boolean;
  refresh?: boolean;
  fullscreen?: boolean;
  pinnable?: boolean;
  isLoading?: boolean;
}

const MyTable = ({
  className,
  columns: initialColumns,
  dataSource: initialDataSource,
  rowKey = "id",
  header,
  bodyClassName,
  pagination = { current: 1, pageSize: 10, total: 0 },
  rowSelection,
  expandable,
  scroll,
  size = "middle",
  bordered = false,
  showHeader = true,
  title,
  footer,
  rowClassName,
  onRow,
  sticky = false,
  searchable = false,
  columnVisibility = false,
  striped = true,
  hoverable = true,
  refresh = true,
  fullscreen = false,
  pinnable = false,
  isLoading = false,
}: IMyTableProps) => {
  const t = useTranslations();

  // Core state management - only essential states
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    rowSelection?.selectedRowKeys || [],
  );
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(
    [],
  );
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [pinnedColumns, setPinnedColumns] = useState<{
    left: string[];
    right: string[];
  }>({ left: [], right: [] });
  const [currentPage, setCurrentPage] = useState(
    pagination ? pagination.current || 1 : 1,
  );
  const [pageSize, setPageSize] = useState(
    pagination ? pagination.pageSize || 10 : 10,
  );

  // Enhanced states - only used ones
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs for functionality
  const tableRef = useRef<HTMLDivElement>(null);

  // Get row key function - memoized for performance
  const getRowKey = useCallback(
    (record: any, index: number) => {
      if (typeof rowKey === "function") {
        return rowKey(record);
      }
      return record[rowKey] || index;
    },
    [rowKey],
  );

  // Filter visible columns - memoized
  const visibleColumns = useMemo(() => {
    return initialColumns.filter(
      (col) => !hiddenColumns.includes(col.key || (col.dataIndex as string)),
    );
  }, [initialColumns, hiddenColumns]);

  // Process data with search, filter, and sort - optimized
  const processedData = useMemo(() => {
    let data = initialDataSource ? [...initialDataSource] : [];

    // Search optimization
    if (searchable && searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      data = data.filter((row) =>
        visibleColumns.some((col) => {
          const value = col.dataIndex
            ? Array.isArray(col.dataIndex)
              ? col.dataIndex.reduce((acc, key) => acc?.[key], row)
              : row[col.dataIndex]
            : "";
          return String(value).toLowerCase().includes(searchLower);
        }),
      );
    }

    // Filter optimization
    const activeFilters = Object.entries(filters).filter(
      ([, filterValues]) => filterValues.length > 0,
    );
    if (activeFilters.length > 0) {
      data = data.filter((row) => {
        return activeFilters.every(([key, filterValues]) => {
          const column = visibleColumns.find(
            (col) => (col.key || col.dataIndex) === key,
          );
          if (!column) return true;

          const value = column.dataIndex
            ? Array.isArray(column.dataIndex)
              ? column.dataIndex.reduce((acc, k) => acc?.[k], row)
              : row[column.dataIndex]
            : "";

          return filterValues.includes(value);
        });
      });
    }

    // Sort optimization
    if (sortConfig) {
      const column = visibleColumns.find(
        (col) => (col.key || col.dataIndex) === sortConfig.key,
      );
      if (column && column.sorter) {
        data.sort((a, b) => {
          if (typeof column.sorter === "function") {
            const result = column.sorter(a, b);
            return sortConfig.direction === "desc" ? -result : result;
          } else {
            const aValue = column.dataIndex
              ? Array.isArray(column.dataIndex)
                ? column.dataIndex.reduce((acc, key) => acc?.[key], a)
                : a[column.dataIndex]
              : "";
            const bValue = column.dataIndex
              ? Array.isArray(column.dataIndex)
                ? column.dataIndex.reduce((acc, key) => acc?.[key], b)
                : b[column.dataIndex]
              : "";

            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
          }
        });
      }
    }

    return data;
  }, [
    initialDataSource,
    visibleColumns,
    searchTerm,
    filters,
    sortConfig,
    searchable,
  ]);

  // Pagination - memoized
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedData.slice(start, end);
  }, [processedData, currentPage, pageSize, pagination]);

  // Keyboard shortcuts - optimized
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "f":
            e.preventDefault();
            break;
          case "a":
            e.preventDefault();
            if (rowSelection) {
              handleSelectAll(true);
            }
            break;
          case "Escape":
            setSelectedRowKeys([]);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [rowSelection]);

  // Event handlers - optimized
  const handleSort = useCallback((columnKey: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        if (prev.direction === "asc") {
          return { key: columnKey, direction: "desc" };
        } else {
          return null;
        }
      } else {
        return { key: columnKey, direction: "asc" };
      }
    });
  }, []);

  const handleFilter = useCallback((columnKey: string, filterValues: any[]) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: filterValues,
    }));
  }, []);

  const handleRowSelect = useCallback(
    (record: any, selected: boolean) => {
      const key = getRowKey(record, 0);
      let newSelectedKeys: (string | number)[];

      if (rowSelection?.type === "radio") {
        newSelectedKeys = selected ? [key] : [];
      } else {
        newSelectedKeys = selected
          ? [...selectedRowKeys, key]
          : selectedRowKeys.filter((k) => k !== key);
      }

      setSelectedRowKeys(newSelectedKeys);
      const selectedRows = paginatedData.filter((row) =>
        newSelectedKeys.includes(getRowKey(row, 0)),
      );

      rowSelection?.onChange?.(newSelectedKeys, selectedRows);
      rowSelection?.onSelect?.(record, selected, selectedRows);
    },
    [selectedRowKeys, paginatedData, rowSelection, getRowKey],
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      const allKeys = paginatedData.map((row, index) => getRowKey(row, index));
      const newSelectedKeys = selected
        ? [...new Set([...selectedRowKeys, ...allKeys])]
        : selectedRowKeys.filter((key) => !allKeys.includes(key));

      setSelectedRowKeys(newSelectedKeys);
      const selectedRows = processedData.filter((row) =>
        newSelectedKeys.includes(getRowKey(row, 0)),
      );

      rowSelection?.onChange?.(newSelectedKeys, selectedRows);
      rowSelection?.onSelectAll?.(selected, selectedRows, paginatedData);
    },
    [paginatedData, selectedRowKeys, processedData, rowSelection, getRowKey],
  );

  const handleExpandRow = useCallback(
    (record: any) => {
      const key = getRowKey(record, 0);
      setExpandedRowKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      );
    },
    [getRowKey],
  );

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      tableRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleColumnPin = useCallback(
    (columnKey: string, position: "left" | "right") => {
      setPinnedColumns((prev) => {
        const newPinned = { ...prev };
        newPinned.left = newPinned.left.filter((k) => k !== columnKey);
        newPinned.right = newPinned.right.filter((k) => k !== columnKey);
        newPinned[position].push(columnKey);
        return newPinned;
      });
    },
    [],
  );

  const hasSelection = rowSelection && paginatedData.length > 0;
  const isAllSelected =
    hasSelection &&
    paginatedData.every((row) => selectedRowKeys.includes(getRowKey(row, 0)));
  const isIndeterminate =
    hasSelection && selectedRowKeys.length > 0 && !isAllSelected;

  return (
    <TooltipProvider>
      <div
        className={cn(
          className,
          isFullscreen && "fixed inset-0 z-50 bg-background",
        )}
        ref={tableRef}
      >
        <Card className="flex flex-col px-5 h-full hide-scroll">
          {/* Enhanced Header */}
          <CardHeader className="z-50 px-0 mx-0">
            {(header ||
              title ||
              searchable ||
              columnVisibility ||
              refresh ||
              fullscreen) && (
              <div className="pb-3 border-b">
                {/* Optimized Toolbar */}
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-wrap gap-2 items-center">
                      {title ? <>{title}</> : <span></span>}
                      {searchable && (
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder={t("search")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {columnVisibility && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <TooltipBtn
                              title={t("ustunlarni boshqarish")}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="mr-2 w-4 h-4" />
                              {t("ustunlar")}
                              <Badge variant="secondary" className="ml-2">
                                {visibleColumns.length}/{initialColumns.length}
                              </Badge>
                            </TooltipBtn>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56"
                            onCloseAutoFocus={(e) => e.preventDefault()}
                          >
                            <DropdownMenuLabel>
                              {t("Column Visibility")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="overflow-y-auto max-h-64">
                              {initialColumns.map((col) => (
                                <DropdownMenuCheckboxItem
                                  key={col.key || (col.dataIndex as string)}
                                  checked={
                                    !hiddenColumns.includes(
                                      col.key || (col.dataIndex as string),
                                    )
                                  }
                                  onCheckedChange={(checked) => {
                                    const columnKey =
                                      col.key || (col.dataIndex as string);
                                    setHiddenColumns((prev) =>
                                      checked
                                        ? prev.filter((k) => k !== columnKey)
                                        : [...prev, columnKey],
                                    );
                                  }}
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span>
                                      {typeof col.title === "string"
                                        ? col.title
                                        : "Column"}
                                    </span>
                                    <div className="flex gap-1">
                                      {pinnable &&
                                        pinnedColumns.left.includes(
                                          col.key || (col.dataIndex as string),
                                        ) && (
                                          <Pin className="w-3 h-3 text-blue-500" />
                                        )}
                                      {pinnable &&
                                        pinnedColumns.right.includes(
                                          col.key || (col.dataIndex as string),
                                        ) && (
                                          <Pin className="w-3 h-3 text-green-500" />
                                        )}
                                    </div>
                                  </div>
                                </DropdownMenuCheckboxItem>
                              ))}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setHiddenColumns([])}
                            >
                              <Eye className="mr-2 w-4 h-4" />
                              {t("show all columns")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setHiddenColumns(
                                  initialColumns.map(
                                    (col) =>
                                      col.key || (col.dataIndex as string),
                                  ),
                                )
                              }
                            >
                              <EyeOff className="mr-2 w-4 h-4" />
                              {t("hide all columns")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {/* Fullscreen Toggle */}
                      {fullscreen && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleFullscreen}
                            >
                              {isFullscreen ? (
                                <Minimize2 className="w-4 h-4" />
                              ) : (
                                <Maximize2 className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isFullscreen
                              ? t("Exit Fullscreen")
                              : t("Enter Fullscreen")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {header}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          {/* Selection Info */}
          {hasSelection && selectedRowKeys.length > 0 && (
            <div className="px-4 py-2 border-b bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedRowKeys.length} {t("selected")}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRowKeys([])}
                >
                  {t("clear")}
                </Button>
              </div>
            </div>
          )}

          {/* Optimized Table */}
          <div
            className={cn(
              "flex-1 overflow-auto",
              scroll?.x && "overflow-x-auto",
              scroll?.y && "overflow-y-auto",
            )}
            style={{ maxHeight: scroll?.y }}
          >
            <Table
              className={cn(
                "hide-scroll",
                size === "small" && "text-sm",
                size === "large" && "text-base",
                bordered && "border",
              )}
            >
              {showHeader && (
                <TableHeader
                  className={sticky ? "sticky top-0 z-10 bg-background" : ""}
                >
                  <TableRow>
                    {/* Selection column */}
                    {hasSelection && (
                      <TableHead className="w-12">
                        {rowSelection?.type !== "radio" && (
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            data-state={
                              isIndeterminate
                                ? "indeterminate"
                                : isAllSelected
                                  ? "checked"
                                  : "unchecked"
                            }
                          />
                        )}
                      </TableHead>
                    )}

                    {/* Expand column */}
                    {expandable && <TableHead className="w-12"></TableHead>}

                    {/* Data columns */}
                    {visibleColumns.map((col, idx) => {
                      const columnKey = col.key ?? col.dataIndex ?? idx;
                      const isSorted = sortConfig?.key === columnKey;
                      const isPinnedLeft =
                        pinnable &&
                        pinnedColumns.left.includes(columnKey as string);
                      const isPinnedRight =
                        pinnable &&
                        pinnedColumns.right.includes(columnKey as string);

                      return (
                        <TableHead
                          key={columnKey as React.Key}
                          style={{
                            width: col.width,
                            textAlign: col.align,
                            position:
                              isPinnedLeft || isPinnedRight
                                ? "sticky"
                                : undefined,
                            left: isPinnedLeft ? 0 : undefined,
                            right: isPinnedRight ? 0 : undefined,
                            zIndex:
                              isPinnedLeft || isPinnedRight ? 50 : undefined,
                          }}
                          className={cn(
                            isPinnedLeft || isPinnedRight
                              ? "bg-background border-r"
                              : "",
                            col.resizable ? "resize-x overflow-hidden" : "",
                            col.sorter
                              ? "cursor-pointer hover:bg-muted/50"
                              : "",
                          )}
                          onClick={() =>
                            col.sorter && handleSort(columnKey as string)
                          }
                        >
                          <div className="flex gap-2 items-center">
                            {col.icon && (
                              <span className="text-muted-foreground">
                                {col.icon}
                              </span>
                            )}
                            <span className={col.ellipsis ? "truncate" : ""}>
                              {typeof col.title === "function"
                                ? col.title()
                                : col.title}
                            </span>

                            {/* Sort indicator */}
                            {col.sorter && isSorted && (
                              <div className="ml-auto">
                                {sortConfig?.direction === "asc" ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <Target className="w-3 h-3 rotate-180" />
                                )}
                              </div>
                            )}

                            {/* Filter button */}
                            {col.filters && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 w-4 h-4"
                                  >
                                    <Filter
                                      className={cn(
                                        "h-3 w-3",
                                        filters[columnKey as string]?.length
                                          ? "text-primary"
                                          : "opacity-50",
                                      )}
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {col.filters.map((filter) => (
                                    <DropdownMenuCheckboxItem
                                      key={filter.value}
                                      checked={filters[
                                        columnKey as string
                                      ]?.includes(filter.value)}
                                      onCheckedChange={(checked) => {
                                        const currentFilters =
                                          filters[columnKey as string] || [];
                                        const newFilters = checked
                                          ? [...currentFilters, filter.value]
                                          : currentFilters.filter(
                                              (v) => v !== filter.value,
                                            );
                                        handleFilter(
                                          columnKey as string,
                                          newFilters,
                                        );
                                      }}
                                    >
                                      {filter.text}
                                    </DropdownMenuCheckboxItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}

                            {/* Pin button */}
                            {pinnable && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 w-4 h-4"
                                  >
                                    <Pin className="w-3 h-3 opacity-50 hover:opacity-100" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleColumnPin(
                                        columnKey as string,
                                        "left",
                                      )
                                    }
                                  >
                                    Pin left
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleColumnPin(
                                        columnKey as string,
                                        "right",
                                      )
                                    }
                                  >
                                    Pin right
                                  </DropdownMenuItem>
                                  {(isPinnedLeft || isPinnedRight) && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setPinnedColumns((prev) => ({
                                          left: prev.left.filter(
                                            (k) => k !== columnKey,
                                          ),
                                          right: prev.right.filter(
                                            (k) => k !== columnKey,
                                          ),
                                        }))
                                      }
                                    >
                                      Unpin
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
              )}

              <TableBody className={bodyClassName}>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_: any, i: number) => (
                    <TableRow key={i}>
                      {Array.from({
                        length:
                          visibleColumns.length +
                          (hasSelection ? 1 : 0) +
                          (expandable ? 1 : 0),
                      }).map((_, i: number) => (
                        <TableCell key={i}>
                          <Skeleton className="h-4 rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <>
                    {paginatedData?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={
                            visibleColumns.length +
                            (hasSelection ? 1 : 0) +
                            (expandable ? 1 : 0)
                          }
                          className="py-8 text-center"
                        >
                          {t("no data")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData?.map((row, rowIdx) => {
                        const key = getRowKey(row, rowIdx);
                        const isSelected = selectedRowKeys.includes(key);
                        const isExpanded = expandedRowKeys.includes(key);
                        const rowProps = onRow?.(row, rowIdx) || {};

                        return (
                          <>
                            <TableRow
                              key={key}
                              className={cn(
                                isSelected && "bg-muted/50",
                                rowClassName?.(row, rowIdx),
                                hoverable && "hover:bg-muted/30",
                                striped && rowIdx % 2 === 0 && "bg-accent/20",
                              )}
                              onClick={rowProps.onClick}
                              onDoubleClick={rowProps.onDoubleClick}
                              onMouseEnter={rowProps.onMouseEnter}
                              onMouseLeave={rowProps.onMouseLeave}
                            >
                              {/* Selection cell */}
                              {hasSelection && (
                                <TableCell>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked: boolean) =>
                                      handleRowSelect(row, checked)
                                    }
                                    disabled={
                                      rowSelection?.getCheckboxProps?.(row)
                                        ?.disabled
                                    }
                                  />
                                </TableCell>
                              )}

                              {/* Expand cell */}
                              {expandable && (
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 w-6 h-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExpandRow(row);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <Target className="w-4 h-4 rotate-90" />
                                    ) : (
                                      <Target className="w-4 h-4" />
                                    )}
                                  </Button>
                                </TableCell>
                              )}

                              {/* Data cells */}
                              {visibleColumns.map((col, colIdx) => {
                                const columnKey =
                                  col.key ?? col.dataIndex ?? colIdx;
                                const isPinnedLeft =
                                  pinnable &&
                                  pinnedColumns.left.includes(
                                    columnKey as string,
                                  );
                                const isPinnedRight =
                                  pinnable &&
                                  pinnedColumns.right.includes(
                                    columnKey as string,
                                  );

                                let value = col.dataIndex
                                  ? Array.isArray(col.dataIndex)
                                    ? col.dataIndex.reduce(
                                        (acc, key) => acc?.[key],
                                        row,
                                      )
                                    : row[col.dataIndex]
                                  : undefined;

                                if (col.render) {
                                  value = col.render(value, row, rowIdx);
                                }

                                return (
                                  <TableCell
                                    key={columnKey as React.Key}
                                    style={{
                                      textAlign: col.align,
                                      position:
                                        isPinnedLeft || isPinnedRight
                                          ? "sticky"
                                          : undefined,
                                      left: isPinnedLeft ? 0 : undefined,
                                      right: isPinnedRight ? 0 : undefined,
                                      zIndex:
                                        isPinnedLeft || isPinnedRight
                                          ? 10
                                          : undefined,
                                    }}
                                    className={cn(
                                      isPinnedLeft ||
                                        (isPinnedRight &&
                                          "bg-background border-r"),
                                      col.ellipsis && "truncate max-w-0",
                                      col.copyable &&
                                        "cursor-pointer hover:underline",
                                    )}
                                    onClick={() =>
                                      col.copyable &&
                                      navigator.clipboard.writeText(
                                        String(value),
                                      )
                                    }
                                    title={
                                      col.tooltip
                                        ? typeof col.tooltip === "function"
                                          ? col.tooltip(value, row)
                                          : col.tooltip
                                        : undefined
                                    }
                                  >
                                    {value}
                                  </TableCell>
                                );
                              })}
                            </TableRow>

                            {/* Expanded row */}
                            {expandable &&
                              isExpanded &&
                              expandable.expandedRowRender && (
                                <TableRow>
                                  <TableCell
                                    colSpan={
                                      visibleColumns.length +
                                      (hasSelection ? 1 : 0) +
                                      1
                                    }
                                    className="p-0"
                                  >
                                    <div className="p-4 bg-muted/20">
                                      {expandable.expandedRowRender(
                                        row,
                                        rowIdx,
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                          </>
                        );
                      })
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          {footer && <div className="z-50 p-4 border-t w-full">{footer}</div>}

          {/* Optimized Pagination */}
          {pagination && processedData.length > 0 && (
            <div className="flex z-50 justify-between items-center p-4 border-t">
              <div className="flex gap-2 items-center">
                {pagination.showSizeChanger && (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("show")}
                    </span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        const newPageSize = Number.parseInt(value);
                        setPageSize(newPageSize);
                        setCurrentPage(1);
                        pagination.onChange?.(1, newPageSize);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          pagination.pageSizeOptions || [
                            "10",
                            "20",
                            "50",
                            "100",
                          ]
                        ).map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                      {t("per page")}
                    </span>
                  </div>
                )}

                {pagination.showTotal && (
                  <span className="text-sm text-muted-foreground">
                    {pagination.showTotal(processedData.length, [
                      (currentPage - 1) * pageSize + 1,
                      Math.min(currentPage * pageSize, processedData.length),
                    ])}
                  </span>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(1);
                    pagination.onChange?.(1, pageSize);
                  }}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    pagination.onChange?.(newPage, pageSize);
                  }}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="px-2 text-sm">
                  {currentPage} / {Math.ceil(processedData.length / pageSize)}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    pagination.onChange?.(newPage, pageSize);
                  }}
                  disabled={
                    currentPage >= Math.ceil(processedData.length / pageSize)
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastPage = Math.ceil(processedData.length / pageSize);
                    setCurrentPage(lastPage);
                    pagination.onChange?.(lastPage, pageSize);
                  }}
                  disabled={
                    currentPage >= Math.ceil(processedData.length / pageSize)
                  }
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default MyTable;
