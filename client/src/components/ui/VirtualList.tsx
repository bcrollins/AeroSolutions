import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  endReachedThreshold?: number;
  onEndReached?: () => void;
  className?: string;
  overscan?: number;
}

/**
 * VirtualList component for rendering large lists with optimal performance
 * Only renders items that are visible within the viewport
 * 
 * @param items - Array of data items to render
 * @param height - Fixed height of the scrollable container
 * @param itemHeight - Fixed height of each item
 * @param renderItem - Function to render each item
 * @param endReachedThreshold - Pixels from the end to trigger onEndReached
 * @param onEndReached - Callback when user scrolls to the end
 * @param className - Optional CSS class
 * @param overscan - Number of items to render outside visible area
 */
function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  endReachedThreshold = 300,
  onEndReached,
  className = '',
  overscan = 3
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [endReached, setEndReached] = useState(false);
  
  // Calculate which items should be visible based on current scroll position
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleItemCount = Math.min(
    items.length - startIndex,
    Math.ceil(height / itemHeight) + overscan * 2
  );
  
  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setScrollTop(scrollTop);
    
    // Check if we're near the end of the list
    const distanceFromEnd = scrollHeight - scrollTop - clientHeight;
    
    if (
      !endReached && 
      distanceFromEnd < endReachedThreshold && 
      onEndReached
    ) {
      setEndReached(true);
      onEndReached();
    } else if (distanceFromEnd >= endReachedThreshold && endReached) {
      setEndReached(false);
    }
  }, [endReached, endReachedThreshold, onEndReached]);
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  
  // Render only the visible items
  const visibleItems = items
    .slice(startIndex, startIndex + visibleItemCount)
    .map((item, index) => (
      <div 
        key={startIndex + index}
        style={{ 
          height: itemHeight, 
          position: 'absolute',
          top: (startIndex + index) * itemHeight,
          left: 0,
          right: 0,
        }}
      >
        {renderItem(item, startIndex + index)}
      </div>
    ));

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height, position: 'relative' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualList;