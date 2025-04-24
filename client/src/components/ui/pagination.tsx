import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Current page index (0-indexed)
   */
  currentPage: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Callback when page is changed
   */
  onPageChange: (page: number) => void;
  
  /**
   * Show first and last page buttons
   * @default true
   */
  showFirstLastButtons?: boolean;
  
  /**
   * Show page size dropdown
   * @default false
   */
  showPageSizeDropdown?: boolean;
  
  /**
   * Page size options
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[];
  
  /**
   * Current page size
   * @default 10
   */
  pageSize?: number;
  
  /**
   * Callback when page size is changed
   */
  onPageSizeChange?: (pageSize: number) => void;
  
  /**
   * Custom sibling count (how many page numbers to show on each side)
   * @default 1
   */
  siblingCount?: number;
  
  /**
   * Show total items count
   * @default false
   */
  showTotalItems?: boolean;
  
  /**
   * Total items count
   */
  totalItems?: number;
  
  /**
   * Disable the pagination
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Make the pagination compact
   * @default false
   */
  compact?: boolean;
}

/**
 * React component for pagination with customizable styling and features.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLastButtons = true,
  showPageSizeDropdown = false,
  pageSizeOptions = [10, 20, 50, 100],
  pageSize = 10,
  onPageSizeChange,
  siblingCount = 1,
  showTotalItems = false,
  totalItems,
  disabled = false,
  compact = false,
  className,
  ...props
}: PaginationProps) {
  // Don't render anything if there's only one page
  if (totalPages <= 1) return null;
  
  // Calculate range of visible page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show the first page
    pageNumbers.push(0);
    
    // Calculate range around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 2);
    
    // Add ellipsis indicators
    const showLeftDots = leftSiblingIndex > 1;
    const showRightDots = rightSiblingIndex < totalPages - 2;
    
    // Generate page numbers between dots
    if (showLeftDots && showRightDots) {
      // Both dots visible - show range around current page
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pageNumbers.push(i);
      }
    } else if (showLeftDots && !showRightDots) {
      // Only left dots - show more pages on the right
      for (let i = leftSiblingIndex; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (!showLeftDots && showRightDots) {
      // Only right dots - show more pages on the left
      for (let i = 1; i <= rightSiblingIndex; i++) {
        pageNumbers.push(i);
      }
    } else {
      // No dots - show all pages
      for (let i = 1; i < totalPages - 1; i++) {
        pageNumbers.push(i);
      }
    }
    
    // Always show the last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages - 1);
    }
    
    // Sort and deduplicate
    return [...new Set(pageNumbers)].sort((a, b) => a - b);
  };
  
  const visiblePageNumbers = getPageNumbers();
  
  // Handle page change
  const handlePageChange = (page: number) => {
    // Ensure page is within bounds
    const targetPage = Math.max(0, Math.min(page, totalPages - 1));
    
    if (targetPage !== currentPage) {
      onPageChange(targetPage);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };
  
  // Calculate item range for display
  const getItemRange = () => {
    const firstItem = currentPage * pageSize + 1;
    const lastItem = Math.min((currentPage + 1) * pageSize, totalItems || 0);
    return `${firstItem}-${lastItem} of ${totalItems}`;
  };
  
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        compact ? "text-xs" : "text-sm",
        className
      )}
      {...props}
    >
      {/* Item count display */}
      {showTotalItems && totalItems != null && (
        <div className="text-muted-foreground">
          Showing {getItemRange()}
        </div>
      )}
      
      {/* Page size dropdown */}
      {showPageSizeDropdown && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Show</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={disabled}
            className={cn(
              "h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Pagination controls */}
      <nav
        role="navigation"
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        {/* First page button */}
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size={compact ? "icon-sm" : "icon"}
            onClick={() => handlePageChange(0)}
            disabled={currentPage === 0 || disabled}
            aria-label="First page"
            className={cn(compact && "h-8 w-8")}
          >
            <ChevronsLeft className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size={compact ? "icon-sm" : "icon"}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0 || disabled}
          aria-label="Previous page"
          className={cn(compact && "h-8 w-8")}
        >
          <ChevronLeft className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center">
          {visiblePageNumbers.map((page, i) => {
            // Add ellipsis if needed
            const ellipsisBefore =
              i > 0 && page > visiblePageNumbers[i - 1] + 1;
              
            return (
              <React.Fragment key={page}>
                {ellipsisBefore && (
                  <Button
                    variant="ghost"
                    size={compact ? "sm" : "default"}
                    className={cn(
                      "cursor-default",
                      compact && "h-8 w-8 px-0"
                    )}
                    disabled
                  >
                    <MoreHorizontal className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                  </Button>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size={compact ? "sm" : "default"}
                  onClick={() => handlePageChange(page)}
                  disabled={disabled}
                  aria-label={`Page ${page + 1}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={cn(
                    compact && "h-8 min-w-8 px-2"
                  )}
                >
                  {page + 1}
                </Button>
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Next page button */}
        <Button
          variant="outline"
          size={compact ? "icon-sm" : "icon"}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || disabled}
          aria-label="Next page"
          className={cn(compact && "h-8 w-8")}
        >
          <ChevronRight className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
        </Button>
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <Button
            variant="outline"
            size={compact ? "icon-sm" : "icon"}
            onClick={() => handlePageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1 || disabled}
            aria-label="Last page"
            className={cn(compact && "h-8 w-8")}
          >
            <ChevronsRight className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        )}
      </nav>
    </div>
  );
}

/**
 * Button size to be used in compact mode
 */
declare module "@/components/ui/button" {
  interface ButtonProps {
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  }
}