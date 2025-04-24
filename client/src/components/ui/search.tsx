import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search as SearchIcon, X, FileDown, ArrowUpDown, Filter, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface SearchFilter {
  /**
   * Unique ID for the filter
   */
  id: string;
  
  /**
   * Display name of the filter
   */
  label: string;
  
  /**
   * Filter value 
   */
  value: string | boolean | number;
  
  /**
   * Type of filter
   */
  type?: 'text' | 'boolean' | 'number' | 'date' | 'select';
  
  /**
   * Options for select filters
   */
  options?: { label: string; value: string | number | boolean }[];
}

export interface SearchField {
  /**
   * Field identifier
   */
  id: string;
  
  /**
   * Display name
   */
  label: string;
  
  /**
   * If the field should be searchable
   */
  searchable?: boolean;
  
  /**
   * If the field can be sorted
   */
  sortable?: boolean;
  
  /**
   * Field can be filtered
   */
  filterable?: boolean;
  
  /**
   * Type of field
   */
  type?: 'text' | 'number' | 'date' | 'boolean';
}

export interface SortOption {
  /**
   * Field to sort by
   */
  field: string;
  
  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
}

export interface SearchProps {
  /**
   * Current search query
   */
  value?: string;
  
  /**
   * Called when search value changes
   */
  onSearch?: (value: string) => void;
  
  /**
   * Called when filters change
   */
  onFilterChange?: (filters: SearchFilter[]) => void;
  
  /**
   * Called when sort option changes
   */
  onSortChange?: (sort: SortOption | null) => void;
  
  /**
   * Called when user clicks download/export
   */
  onExport?: () => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Show the clear button
   */
  showClear?: boolean;
  
  /**
   * Icon displayed in the search input
   */
  icon?: React.ReactNode;
  
  /**
   * Show export button
   */
  showExport?: boolean;
  
  /**
   * Show advanced filters button
   */
  showFilters?: boolean;
  
  /**
   * Show sorting options
   */
  showSort?: boolean;
  
  /**
   * Available fields for filtering and sorting
   */
  fields?: SearchField[];
  
  /**
   * Current active filters
   */
  activeFilters?: SearchFilter[];
  
  /**
   * Current sort option
   */
  sortOption?: SortOption | null;
  
  /**
   * Custom CSS class
   */
  className?: string;
  
  /**
   * Is data currently loading
   */
  isLoading?: boolean;
  
  /**
   * Additional action buttons
   */
  actions?: React.ReactNode;
  
  /**
   * If search should autofocus on mount
   */
  autoFocus?: boolean;
  
  /**
   * Debounce search input (ms)
   */
  debounce?: number;
}

export function Search({
  value = '',
  onSearch,
  onFilterChange,
  onSortChange,
  onExport,
  placeholder = 'Search...',
  showClear = true,
  icon = <SearchIcon className="h-4 w-4" />,
  showExport = false,
  showFilters = false,
  showSort = false,
  fields = [],
  activeFilters = [],
  sortOption = null,
  className,
  isLoading = false,
  actions,
  autoFocus = false,
  debounce = 300,
}: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Sync search query with value prop
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);
  
  // Autofocus the input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Handle search input change with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (onSearch) {
        onSearch(newValue);
      }
    }, debounce);
  }, [onSearch, debounce]);
  
  // Clear search input
  const handleClear = useCallback(() => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onSearch]);
  
  // Handle sorting change
  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc') => {
    if (onSortChange) {
      const newSort: SortOption = { field, direction };
      onSortChange(newSort);
    }
  }, [onSortChange]);
  
  // Toggle filter
  const toggleFilter = useCallback((filter: SearchFilter) => {
    if (!onFilterChange) return;
    
    const isActive = activeFilters.some(f => f.id === filter.id);
    
    if (isActive) {
      onFilterChange(activeFilters.filter(f => f.id !== filter.id));
    } else {
      onFilterChange([...activeFilters, filter]);
    }
  }, [activeFilters, onFilterChange]);
  
  // Handle filter removal from badge
  const handleRemoveFilter = useCallback((filterId: string) => {
    if (onFilterChange) {
      onFilterChange(activeFilters.filter(f => f.id !== filterId));
    }
  }, [activeFilters, onFilterChange]);
  
  // Clear all filters
  const handleClearFilters = useCallback(() => {
    if (onFilterChange) {
      onFilterChange([]);
    }
  }, [onFilterChange]);
  
  // Clear sorting
  const handleClearSort = useCallback(() => {
    if (onSortChange) {
      onSortChange(null);
    }
  }, [onSortChange]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative flex items-center w-full gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            {icon}
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className={cn(
              "pl-10 pr-10",
              isFocused && "ring-2 ring-ring",
              isLoading && "opacity-70"
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
          />
          {showClear && searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={handleClear}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          {showSort && fields.some(f => f.sortable) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant={sortOption ? "default" : "outline"} 
                        size="icon"
                        disabled={isLoading}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {fields
                        .filter(field => field.sortable)
                        .map(field => (
                          <React.Fragment key={field.id}>
                            <DropdownMenuItem 
                              onClick={() => handleSortChange(field.id, 'asc')}
                              className={cn(
                                sortOption?.field === field.id && sortOption?.direction === 'asc' 
                                  ? "bg-muted font-medium" 
                                  : ""
                              )}
                            >
                              {field.label} (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSortChange(field.id, 'desc')}
                              className={cn(
                                sortOption?.field === field.id && sortOption?.direction === 'desc' 
                                  ? "bg-muted font-medium" 
                                  : ""
                              )}
                            >
                              {field.label} (Z-A)
                            </DropdownMenuItem>
                          </React.Fragment>
                        ))}
                      {sortOption && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleClearSort}>
                            Clear sorting
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Sort results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Filter button */}
          {showFilters && fields.some(f => f.filterable) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant={activeFilters.length > 0 ? "default" : "outline"} 
                        size="icon"
                        disabled={isLoading}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Filters</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {fields
                        .filter(field => field.filterable)
                        .map(field => {
                          if (field.type === 'boolean') {
                            const isTrue = activeFilters.some(
                              f => f.id === `${field.id}:true`
                            );
                            const isFalse = activeFilters.some(
                              f => f.id === `${field.id}:false`
                            );
                            
                            return (
                              <React.Fragment key={field.id}>
                                <DropdownMenuCheckboxItem
                                  checked={isTrue}
                                  onCheckedChange={() => 
                                    toggleFilter({ 
                                      id: `${field.id}:true`, 
                                      label: `${field.label}: Yes`, 
                                      value: true,
                                      type: 'boolean'
                                    })
                                  }
                                >
                                  {field.label}: Yes
                                </DropdownMenuCheckboxItem>
                                <DropdownMenuCheckboxItem
                                  checked={isFalse}
                                  onCheckedChange={() => 
                                    toggleFilter({ 
                                      id: `${field.id}:false`, 
                                      label: `${field.label}: No`, 
                                      value: false,
                                      type: 'boolean'
                                    })
                                  }
                                >
                                  {field.label}: No
                                </DropdownMenuCheckboxItem>
                              </React.Fragment>
                            );
                          } else {
                            // For other field types, advanced filtering could be implemented
                            return (
                              <DropdownMenuItem 
                                key={field.id}
                                onClick={() => {
                                  // Simple filter implementation
                                  // In real app, this would show a dialog for complex filtering
                                  const value = window.prompt(`Filter by ${field.label}:`);
                                  if (value) {
                                    toggleFilter({
                                      id: `${field.id}:${value}`,
                                      label: `${field.label}: ${value}`,
                                      value: value
                                    });
                                  }
                                }}
                              >
                                Filter by {field.label}
                              </DropdownMenuItem>
                            );
                          }
                        })}
                      {activeFilters.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleClearFilters}>
                            Clear all filters
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Filter results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Export button */}
          {showExport && onExport && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onExport}
                    disabled={isLoading}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Export results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Custom actions */}
          {actions}
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {activeFilters.map(filter => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveFilter(filter.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          ))}
          {activeFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={handleClearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}