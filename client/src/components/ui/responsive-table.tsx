import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Loader } from './loader';

export interface ColumnDef<T> {
  accessorKey: string;
  header: string;
  cell?: (info: { row: T }) => React.ReactNode;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  meta?: {
    className?: string;
  };
}

export interface ResponsiveTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  caption?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  rowActions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
  }[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  initialPageSize?: number;
  className?: string;
}

function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  caption,
  isLoading = false,
  onRowClick,
  rowActions,
  enableSorting = false,
  enableFiltering = false,
  enablePagination = false,
  initialPageSize = 10,
  className,
}: ResponsiveTableProps<T>) {
  const [sorting, setSorting] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Apply sorting
  const sortedData = React.useMemo(() => {
    if (!sorting) return data;
    
    return [...data].sort((a, b) => {
      const column = sorting.column;
      const valueA = a[column];
      const valueB = b[column];
      
      if (valueA === valueB) return 0;
      
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;
      
      // Check if values are strings or numbers
      const comparison = typeof valueA === 'string' 
        ? valueA.localeCompare(valueB) 
        : valueA - valueB;
      
      return sorting.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sorting]);
  
  // Apply filtering
  const filteredData = React.useMemo(() => {
    return sortedData.filter(row => {
      // Check if row matches all filters
      return Object.entries(filters).every(([column, filterValue]) => {
        if (!filterValue.trim()) return true;
        
        const columnValue = row[column];
        if (columnValue === null || columnValue === undefined) return false;
        
        return String(columnValue)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      });
    });
  }, [sortedData, filters]);
  
  // Apply pagination
  const paginatedData = React.useMemo(() => {
    if (!enablePagination) return filteredData;
    
    const startIdx = currentPage * pageSize;
    return filteredData.slice(startIdx, startIdx + pageSize);
  }, [filteredData, currentPage, pageSize, enablePagination]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (!enableSorting) return;
    
    if (sorting?.column === column) {
      if (sorting.direction === 'asc') {
        setSorting({ column, direction: 'desc' });
      } else {
        setSorting(null);
      }
    } else {
      setSorting({ column, direction: 'asc' });
    }
  };
  
  // Handle filtering
  const handleFilter = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value,
    }));
    // Reset to first page when filtering
    setCurrentPage(0);
  };
  
  // Handle pagination
  const handlePageChange = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };
  
  // Mobile rendering - on small screens, show a more compact version
  return (
    <div className="w-full overflow-auto">
      {enableFiltering && (
        <div className="flex flex-wrap gap-2 mb-4">
          {columns
            .filter(col => col.enableColumnFilter !== false)
            .map(column => (
              <div key={column.accessorKey} className="flex-1 min-w-[200px]">
                <Input
                  placeholder={`Filter ${column.header}...`}
                  value={filters[column.accessorKey] || ''}
                  onChange={(e) => handleFilter(column.accessorKey, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
        </div>
      )}
      
      <div className={cn("relative rounded-md border", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        )}
        
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.accessorKey}
                  className={cn(column.meta?.className)}
                >
                  {enableSorting && column.enableSorting !== false ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3 h-8 data-[state=open]:bg-accent"
                      onClick={() => handleSort(column.accessorKey)}
                    >
                      <span>{column.header}</span>
                      {sorting?.column === column.accessorKey ? (
                        <ChevronDown
                          className={cn(
                            "ml-2 h-4 w-4 shrink-0 transition-transform duration-200",
                            sorting.direction === 'desc' ? 'rotate-180' : ''
                          )}
                        />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-30" />
                      )}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-[60px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (rowActions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.accessorKey}
                      className={cn(column.meta?.className)}
                    >
                      {column.cell
                        ? column.cell({ row })
                        : row[column.accessorKey]}
                    </TableCell>
                  ))}
                  
                  {rowActions && (
                    <TableCell className="p-0 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {rowActions.map((action, i) => (
                            <React.Fragment key={i}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                              >
                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                {action.label}
                              </DropdownMenuItem>
                              {i < rowActions.length - 1 && <DropdownMenuSeparator />}
                            </React.Fragment>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Mobile version for small screens - appears below table for accessibility */}
        <div className="md:hidden mt-4 space-y-3">
          {paginatedData.map((row, rowIndex) => (
            <div
              key={rowIndex} 
              className={cn(
                "border rounded-lg p-3",
                onRowClick && "cursor-pointer hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <div key={column.accessorKey} className="flex justify-between py-1 border-b last:border-b-0">
                  <div className="font-medium">{column.header}</div>
                  <div className={cn("text-right", column.meta?.className)}>
                    {column.cell
                      ? column.cell({ row })
                      : row[column.accessorKey]}
                  </div>
                </div>
              ))}
              
              {rowActions && rowActions.length > 0 && (
                <div className="flex justify-end mt-2 pt-2 border-t">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      {rowActions.map((action, i) => (
                        <React.Fragment key={i}>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                          >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                          </DropdownMenuItem>
                          {i < rowActions.length - 1 && <DropdownMenuSeparator />}
                        </React.Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Pagination controls */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {currentPage * pageSize + 1}-
            {Math.min((currentPage + 1) * pageSize, filteredData.length)} of {filteredData.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum = i;
              
              // Show smart pagination when more than 5 pages
              if (totalPages > 5) {
                if (currentPage < 3) {
                  // Near start, show first 5 pages
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  // Near end, show last 5 pages
                  pageNum = totalPages - 5 + i;
                } else {
                  // In middle, show current page and 2 on each side
                  pageNum = currentPage - 2 + i;
                }
              }
              
              // Only render if valid page
              if (pageNum >= 0 && pageNum < totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              }
              return null;
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ResponsiveTable };