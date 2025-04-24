import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useLocalStorage from './useLocalStorage';

interface PaginationOptions {
  /**
   * Initial page index (0-indexed)
   * @default 0
   */
  initialPage?: number;
  
  /**
   * Initial page size
   * @default 10
   */
  initialPageSize?: number;
  
  /**
   * Total number of items (if known)
   */
  totalItems?: number;
  
  /**
   * Store pagination state in local storage
   * @default false
   */
  persistState?: boolean;
  
  /**
   * Local storage key for persisting pagination state
   * @default "pagination_state"
   */
  storageKey?: string;
  
  /**
   * Callback when page or page size changes
   */
  onChange?: (page: number, pageSize: number) => void;
}

interface PaginationState {
  page: number;
  pageSize: number;
}

interface PaginationResult {
  /** Current page (0-indexed) */
  page: number;
  
  /** Number of items per page */
  pageSize: number;
  
  /** Total number of pages (if totalItems is provided) */
  totalPages: number;
  
  /** Current page (1-indexed, for display) */
  currentPage: number;
  
  /** Function to change the current page */
  setPage: (page: number) => void;
  
  /** Function to change the page size */
  setPageSize: (size: number) => void;
  
  /** Function to go to the next page */
  nextPage: () => void;
  
  /** Function to go to the previous page */
  prevPage: () => void;
  
  /** Function to go to the first page */
  firstPage: () => void;
  
  /** Function to go to the last page */
  lastPage: () => void;
  
  /** Check if current page is the first page */
  isFirstPage: boolean;
  
  /** Check if current page is the last page */
  isLastPage: boolean;
  
  /** Calculate the starting index for the current page */
  startIndex: number;
  
  /** Calculate the ending index for the current page */
  endIndex: number;
  
  /** Calculate the range of items being displayed */
  pageRange: string;
  
  /** PaginationProps for the Pagination component */
  paginationProps: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    totalItems?: number;
  };
}

/**
 * Hook for managing pagination state with optional React Query integration.
 */
export function usePagination({
  initialPage = 0,
  initialPageSize = 10,
  totalItems,
  persistState = false,
  storageKey = "pagination_state",
  onChange,
}: PaginationOptions = {}): PaginationResult {
  // Use either local state or localStorage based on persistState option
  const [state, setState] = persistState 
    ? useLocalStorage<PaginationState>(storageKey, { page: initialPage, pageSize: initialPageSize })
    : useState<PaginationState>({ page: initialPage, pageSize: initialPageSize });
    
  const { page, pageSize } = state;
  
  // Access QueryClient for cache management 
  const queryClient = useQueryClient();
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    if (totalItems === undefined) return 1;
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);
  
  // Ensure page is within valid range
  const currentPageInRange = useMemo(() => {
    return Math.max(0, Math.min(page, totalPages - 1));
  }, [page, totalPages]);
  
  // Update page if it's out of range after total pages changes
  if (page !== currentPageInRange) {
    setState(prev => ({ ...prev, page: currentPageInRange }));
  }
  
  // Set page method
  const setPage = useCallback((newPage: number) => {
    const boundedPage = Math.max(0, Math.min(newPage, totalPages - 1));
    
    setState(prev => {
      // Only update if the page actually changed
      if (prev.page === boundedPage) return prev;
      
      // Call onChange callback if provided
      if (onChange) {
        onChange(boundedPage, prev.pageSize);
      }
      
      return { ...prev, page: boundedPage };
    });
  }, [totalPages, onChange, setState]);
  
  // Set page size method
  const setPageSize = useCallback((newPageSize: number) => {
    setState(prev => {
      // Calculate what the new current page should be to keep items position approximately the same
      const firstItemIndex = prev.page * prev.pageSize;
      const newPage = Math.floor(firstItemIndex / newPageSize);
      const boundedPage = Math.max(0, Math.min(newPage, Math.ceil((totalItems || 0) / newPageSize) - 1));
      
      // Call onChange callback if provided
      if (onChange) {
        onChange(boundedPage, newPageSize);
      }
      
      return { page: boundedPage, pageSize: newPageSize };
    });
    
    // Invalidate queries that might be affected by page size change
    queryClient.invalidateQueries();
  }, [totalItems, onChange, setState, queryClient]);
  
  // Navigation methods
  const nextPage = useCallback(() => setPage(page + 1), [page, setPage]);
  const prevPage = useCallback(() => setPage(page - 1), [page, setPage]);
  const firstPage = useCallback(() => setPage(0), [setPage]);
  const lastPage = useCallback(() => setPage(totalPages - 1), [totalPages, setPage]);
  
  // Calculate indexes and status
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, (totalItems || 0) - 1);
  const isFirstPage = page === 0;
  const isLastPage = page >= totalPages - 1;
  
  // Format page range for display
  const pageRange = totalItems === undefined 
    ? `Page ${page + 1}` 
    : `${startIndex + 1}-${endIndex + 1} of ${totalItems}`;
  
  // Prepare props object for Pagination component
  const paginationProps = {
    currentPage: page,
    totalPages,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    totalItems,
  };
  
  return {
    page,
    pageSize,
    totalPages,
    currentPage: page + 1, // 1-indexed for display
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    isFirstPage,
    isLastPage,
    startIndex,
    endIndex,
    pageRange,
    paginationProps,
  };
}