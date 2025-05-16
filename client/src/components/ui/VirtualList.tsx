import React, { useState, useEffect, useRef, useMemo } from 'react';
import { debounce } from '@/utils/performanceUtils';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number | ((item: T, index: number) => number);
  height?: number | string;
  width?: number | string;
  overscanCount?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onItemsRendered?: (startIndex: number, endIndex: number) => void;
  scrollToIndex?: number;
  initialScrollOffset?: number;
  scrollOffset?: number;
}

/**
 * VirtualList component for efficient rendering of large lists
 * 
 * Features:
 * - Renders only visible items for performance
 * - Dynamic item heights support
 * - Smooth scrolling
 * - Customizable overscan area
 * - Scroll events and item visibility callbacks
 */
function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  height = 400,
  width = '100%',
  overscanCount = 3,
  className = '',
  onScroll,
  onItemsRendered,
  scrollToIndex,
  initialScrollOffset = 0,
  scrollOffset
}: VirtualListProps<T>): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(initialScrollOffset);
  
  // Calculate the total height of all items
  const totalHeight = useMemo(() => {
    return items.reduce((acc, item, index) => {
      const height = typeof itemHeight === 'function' ? itemHeight(item, index) : itemHeight;
      return acc + height;
    }, 0);
  }, [items, itemHeight]);
  
  // Get the item heights
  const getItemHeight = (index: number): number => {
    const item = items[index];
    return typeof itemHeight === 'function' ? itemHeight(item, index) : itemHeight;
  };
  
  // Calculate the position of each item
  const itemPositions = useMemo(() => {
    const positions: { top: number; bottom: number; height: number }[] = [];
    let currentOffset = 0;
    
    items.forEach((item, index) => {
      const height = getItemHeight(index);
      positions.push({
        top: currentOffset,
        bottom: currentOffset + height,
        height
      });
      currentOffset += height;
    });
    
    return positions;
  }, [items, getItemHeight]);
  
  // Find the visible range of items
  const visibleRange = useMemo(() => {
    if (!itemPositions.length) return { start: 0, end: 0 };
    
    const containerHeight = typeof height === 'number' ? height : 0;
    const start = itemPositions.findIndex(pos => pos.bottom > scrollTop);
    const end = itemPositions.findIndex(pos => pos.top > scrollTop + containerHeight);
    
    return {
      start: Math.max(0, start - overscanCount),
      end: end === -1 ? items.length - 1 : Math.min(items.length - 1, end + overscanCount)
    };
  }, [scrollTop, itemPositions, height, overscanCount, items.length]);
  
  // Initialize scroll to index if provided
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      const targetPosition = itemPositions[scrollToIndex]?.top || 0;
      containerRef.current.scrollTop = targetPosition;
    }
  }, [scrollToIndex, itemPositions]);
  
  // Handle explicit scroll offset
  useEffect(() => {
    if (scrollOffset !== undefined && containerRef.current) {
      containerRef.current.scrollTop = scrollOffset;
    }
  }, [scrollOffset]);
  
  // Handle scroll events
  const handleScroll = useMemo(() => 
    debounce((e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      
      if (onScroll) {
        onScroll(newScrollTop);
      }
      
      if (onItemsRendered) {
        onItemsRendered(visibleRange.start, visibleRange.end);
      }
    }, 10),
    [onScroll, onItemsRendered, visibleRange]
  );
  
  // Render only the visible items
  const visibleItems = useMemo(() => {
    const { start, end } = visibleRange;
    return items.slice(start, end + 1).map((item, index) => {
      const actualIndex = start + index;
      const { top, height } = itemPositions[actualIndex];
      
      return (
        <div
          key={actualIndex}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height,
            transform: `translateY(${top}px)`
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [items, visibleRange, itemPositions, renderItem]);
  
  // Trigger onItemsRendered when visible range changes
  useEffect(() => {
    if (onItemsRendered) {
      onItemsRendered(visibleRange.start, visibleRange.end);
    }
  }, [visibleRange, onItemsRendered]);
  
  return (
    <div
      ref={containerRef}
      className={`virtual-list-container relative overflow-auto ${className}`}
      style={{
        height,
        width,
        position: 'relative',
        overflowY: 'auto'
      }}
      onScroll={handleScroll}
    >
      <div
        className="virtual-list-content"
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualList;