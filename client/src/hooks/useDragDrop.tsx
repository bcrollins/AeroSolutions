import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Types for drag and drop
export type DraggableItem = {
  id: string;
  [key: string]: any;
};

export type DropResult = {
  source: {
    index: number;
    droppableId: string;
  };
  destination: {
    index: number;
    droppableId: string;
  } | null;
  draggableId: string;
};

export type DropHandler = (result: DropResult) => void;

// Hook options
type UseDragDropOptions = {
  /**
   * Initial items
   */
  initialItems?: DraggableItem[];
  
  /**
   * External onDrop handler to use in addition to internal state update
   */
  onDrop?: DropHandler;
  
  /**
   * Callback when dragging starts
   */
  onDragStart?: (id: string) => void;
  
  /**
   * Callback when dragging ends
   */
  onDragEnd?: (id: string | null) => void;
  
  /**
   * Maintain state internally
   * @default true
   */
  manageState?: boolean;
  
  /**
   * Allow moving between dropzones
   * @default true
   */
  allowCrossDrop?: boolean;
  
  /**
   * Enable dropping on a specific dropzone
   */
  isDropDisabled?: Record<string, boolean>;
  
  /**
   * Direction of drag movement ('horizontal' | 'vertical')
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';
  
  /**
   * Custom drag delay in milliseconds
   * @default 0
   */
  dragDelay?: number;
  
  /**
   * Enable touch support
   * @default true
   */
  enableTouchSupport?: boolean;
};

// Context definition for drag and drop
type DragDropContextValue = {
  /**
   * Items mapped by dropzone id
   */
  items: Record<string, DraggableItem[]>;
  
  /**
   * Create props for a dropzone
   */
  getDroppableProps: (id: string) => React.HTMLAttributes<HTMLElement>;
  
  /**
   * Create props for an item
   */
  getDraggableProps: (item: DraggableItem, index: number, droppableId: string) => React.HTMLAttributes<HTMLElement>;
  
  /**
   * Current dragging item id
   */
  draggingId: string | null;
  
  /**
   * Set items in a specific dropzone
   */
  setDropzoneItems: (droppableId: string, items: DraggableItem[]) => void;
  
  /**
   * Add an item to a dropzone
   */
  addItem: (droppableId: string, item: DraggableItem) => void;
  
  /**
   * Remove an item from a dropzone
   */
  removeItem: (droppableId: string, itemId: string) => void;
  
  /**
   * Move an item within or between dropzones
   */
  moveItem: (source: { droppableId: string, index: number }, destination: { droppableId: string, index: number }, itemId: string) => void;
  
  /**
   * Class name for a dropzone
   */
  dropzoneClassName: (isDraggingOver: boolean) => string;
  
  /**
   * Class name for a draggable item
   */
  draggableClassName: (isDragging: boolean, dragOverlay?: boolean) => string;
};

// Create a React context for drag and drop
export const DragDropContext = React.createContext<DragDropContextValue | undefined>(undefined);

/**
 * Hook for implementing drag and drop functionality
 */
export function useDragDrop(options: UseDragDropOptions = {}) {
  const {
    initialItems = [],
    onDrop,
    onDragStart,
    onDragEnd,
    manageState = true,
    allowCrossDrop = true,
    isDropDisabled = {},
    direction = 'vertical',
    dragDelay = 0,
    enableTouchSupport = true,
  } = options;
  
  // State for items by dropzone
  const [itemsByDropzone, setItemsByDropzone] = useState<Record<string, DraggableItem[]>>({
    default: initialItems,
  });
  
  // State and refs for dragging
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDropzoneId, setDragOverDropzoneId] = useState<string | null>(null);
  const dragSourceRef = useRef<{ droppableId: string; index: number } | null>(null);
  const dragItemRef = useRef<DraggableItem | null>(null);
  const dragDelayTimerRef = useRef<number | null>(null);
  const dragPositionRef = useRef<{ clientX: number; clientY: number } | null>(null);
  
  // Set dropzone items
  const setDropzoneItems = useCallback((droppableId: string, items: DraggableItem[]) => {
    setItemsByDropzone(prev => ({
      ...prev,
      [droppableId]: items,
    }));
  }, []);
  
  // Add an item to a dropzone
  const addItem = useCallback((droppableId: string, item: DraggableItem) => {
    setItemsByDropzone(prev => ({
      ...prev,
      [droppableId]: [...(prev[droppableId] || []), item],
    }));
  }, []);
  
  // Remove an item from a dropzone
  const removeItem = useCallback((droppableId: string, itemId: string) => {
    setItemsByDropzone(prev => ({
      ...prev,
      [droppableId]: (prev[droppableId] || []).filter(item => item.id !== itemId),
    }));
  }, []);
  
  // Reorder items within a dropzone
  const reorderItems = useCallback((droppableId: string, startIndex: number, endIndex: number) => {
    const result = Array.from(itemsByDropzone[droppableId] || []);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setItemsByDropzone(prev => ({
      ...prev,
      [droppableId]: result,
    }));
  }, [itemsByDropzone]);
  
  // Move an item from one dropzone to another
  const moveItemBetweenDropzones = useCallback((
    sourceDroppableId: string,
    sourceIndex: number,
    destDroppableId: string,
    destIndex: number
  ) => {
    const sourceItems = Array.from(itemsByDropzone[sourceDroppableId] || []);
    const destItems = Array.from(itemsByDropzone[destDroppableId] || []);
    
    const [removed] = sourceItems.splice(sourceIndex, 1);
    destItems.splice(destIndex, 0, removed);
    
    setItemsByDropzone(prev => ({
      ...prev,
      [sourceDroppableId]: sourceItems,
      [destDroppableId]: destItems,
    }));
  }, [itemsByDropzone]);
  
  // Move an item - handles both reordering and cross-dropzone moves
  const moveItem = useCallback((
    source: { droppableId: string, index: number },
    destination: { droppableId: string, index: number },
    itemId: string
  ) => {
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId) {
      reorderItems(source.droppableId, source.index, destination.index);
    } else if (allowCrossDrop) {
      moveItemBetweenDropzones(
        source.droppableId,
        source.index,
        destination.droppableId,
        destination.index
      );
    }
  }, [reorderItems, moveItemBetweenDropzones, allowCrossDrop]);
  
  // Handle drop result
  const handleDrop = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Call external handler if provided
    if (onDrop) {
      onDrop(result);
    }
    
    // Update internal state if enabled
    if (manageState && destination) {
      moveItem(source, destination, draggableId);
    }
    
    // Reset dragging state
    setDraggingId(null);
    if (onDragEnd) onDragEnd(null);
  }, [onDrop, manageState, moveItem, onDragEnd]);
  
  // Get the index of an item in a dropzone
  const getItemIndex = useCallback((droppableId: string, itemId: string): number => {
    const items = itemsByDropzone[droppableId] || [];
    return items.findIndex(item => item.id === itemId);
  }, [itemsByDropzone]);
  
  // Get dropzone styles and event handlers
  const getDroppableProps = useCallback((droppableId: string): React.HTMLAttributes<HTMLElement> => {
    // Register the dropzone if it doesn't exist yet
    if (!itemsByDropzone[droppableId]) {
      setItemsByDropzone(prev => ({
        ...prev,
        [droppableId]: [],
      }));
    }
    
    return {
      'data-droppable-id': droppableId,
      onDragOver: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setDragOverDropzoneId(droppableId);
      },
      onDragEnter: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        setDragOverDropzoneId(droppableId);
      },
      onDragLeave: () => {
        setDragOverDropzoneId(null);
      },
      onDrop: (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        
        // Skip if dropping is disabled for this dropzone
        if (isDropDisabled[droppableId]) return;
        
        // If we have a source and an item
        if (dragSourceRef.current && dragItemRef.current) {
          const source = dragSourceRef.current;
          
          // Find the closest index for insertion based on the drop position
          const dropzoneItems = itemsByDropzone[droppableId] || [];
          let insertIndex = dropzoneItems.length;
          
          // Use custom drop position logic (simplified for this example)
          const droppableRect = e.currentTarget.getBoundingClientRect();
          const position = direction === 'horizontal' 
            ? (e.clientX - droppableRect.left) / droppableRect.width 
            : (e.clientY - droppableRect.top) / droppableRect.height;
            
          insertIndex = Math.floor(position * dropzoneItems.length);
          if (insertIndex > dropzoneItems.length) insertIndex = dropzoneItems.length;
          
          const result: DropResult = {
            source: source,
            destination: {
              droppableId,
              index: insertIndex,
            },
            draggableId: dragItemRef.current.id,
          };
          
          handleDrop(result);
        }
        
        setDragOverDropzoneId(null);
        dragSourceRef.current = null;
        dragItemRef.current = null;
      },
    };
  }, [itemsByDropzone, isDropDisabled, direction, handleDrop]);
  
  // Get draggable item props
  const getDraggableProps = useCallback((
    item: DraggableItem, 
    index: number, 
    droppableId: string
  ): React.HTMLAttributes<HTMLElement> => {
    return {
      draggable: true,
      'data-draggable-id': item.id,
      'data-index': index,
      'data-droppable-id': droppableId,
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        
        // Set drag data for compatibility
        e.dataTransfer.setData('text/plain', item.id);
        
        // Set drag state
        if (dragDelay === 0) {
          setDraggingId(item.id);
          dragSourceRef.current = { droppableId, index };
          dragItemRef.current = item;
          if (onDragStart) onDragStart(item.id);
        }
      },
      onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
        if (dragDelay > 0) {
          dragPositionRef.current = { clientX: e.clientX, clientY: e.clientY };
          
          // Start a timer for delayed drag start
          if (dragDelayTimerRef.current) {
            window.clearTimeout(dragDelayTimerRef.current);
          }
          
          dragDelayTimerRef.current = window.setTimeout(() => {
            setDraggingId(item.id);
            dragSourceRef.current = { droppableId, index };
            dragItemRef.current = item;
            if (onDragStart) onDragStart(item.id);
          }, dragDelay);
        }
      },
      onMouseUp: () => {
        if (dragDelayTimerRef.current) {
          window.clearTimeout(dragDelayTimerRef.current);
          dragDelayTimerRef.current = null;
        }
      },
      onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
        // Cancel delayed drag if mouse moved significantly
        if (dragDelay > 0 && dragDelayTimerRef.current && dragPositionRef.current) {
          const { clientX, clientY } = dragPositionRef.current;
          const moveThreshold = 5; // pixels
          
          if (
            Math.abs(e.clientX - clientX) > moveThreshold ||
            Math.abs(e.clientY - clientY) > moveThreshold
          ) {
            window.clearTimeout(dragDelayTimerRef.current);
            dragDelayTimerRef.current = null;
          }
        }
      },
      onDragEnd: () => {
        // Handle drag cancellation
        if (draggingId && !dragOverDropzoneId) {
          const result: DropResult = {
            source: dragSourceRef.current!,
            destination: null,
            draggableId: item.id,
          };
          
          handleDrop(result);
        }
        
        // Reset drag state
        setDraggingId(null);
        dragSourceRef.current = null;
        dragItemRef.current = null;
        dragPositionRef.current = null;
        if (onDragEnd) onDragEnd(null);
      },
      // Add touch event handlers if enabled
      ...(enableTouchSupport && {
        onTouchStart: (e: React.TouchEvent<HTMLElement>) => {
          const touch = e.touches[0];
          dragPositionRef.current = { clientX: touch.clientX, clientY: touch.clientY };
          
          if (dragDelay > 0) {
            if (dragDelayTimerRef.current) {
              window.clearTimeout(dragDelayTimerRef.current);
            }
            
            dragDelayTimerRef.current = window.setTimeout(() => {
              setDraggingId(item.id);
              dragSourceRef.current = { droppableId, index };
              dragItemRef.current = item;
              if (onDragStart) onDragStart(item.id);
            }, dragDelay);
          } else {
            setDraggingId(item.id);
            dragSourceRef.current = { droppableId, index };
            dragItemRef.current = item;
            if (onDragStart) onDragStart(item.id);
          }
        },
        onTouchMove: (e: React.TouchEvent<HTMLElement>) => {
          if (dragDelay > 0 && dragDelayTimerRef.current && dragPositionRef.current) {
            const touch = e.touches[0];
            const { clientX, clientY } = dragPositionRef.current;
            const moveThreshold = 10; // pixels, higher for touch
            
            if (
              Math.abs(touch.clientX - clientX) > moveThreshold ||
              Math.abs(touch.clientY - clientY) > moveThreshold
            ) {
              window.clearTimeout(dragDelayTimerRef.current);
              dragDelayTimerRef.current = null;
            }
          }
        },
        onTouchEnd: () => {
          if (dragDelayTimerRef.current) {
            window.clearTimeout(dragDelayTimerRef.current);
            dragDelayTimerRef.current = null;
          }
          
          if (draggingId) {
            setDraggingId(null);
            if (onDragEnd) onDragEnd(null);
          }
        },
      }),
    };
  }, [draggingId, dragOverDropzoneId, onDragStart, onDragEnd, handleDrop, dragDelay, enableTouchSupport]);
  
  // Class names for styling
  const dropzoneClassName = useCallback((isDraggingOver: boolean) => {
    return cn(
      'drag-dropzone',
      isDraggingOver && 'drag-dropzone-active'
    );
  }, []);
  
  const draggableClassName = useCallback((isDragging: boolean, dragOverlay = false) => {
    return cn(
      'draggable-item',
      isDragging && 'draggable-item-dragging',
      dragOverlay && 'draggable-item-overlay'
    );
  }, []);
  
  // Context value
  const contextValue: DragDropContextValue = {
    items: itemsByDropzone,
    getDroppableProps,
    getDraggableProps,
    draggingId,
    setDropzoneItems,
    addItem,
    removeItem,
    moveItem,
    dropzoneClassName,
    draggableClassName,
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dragDelayTimerRef.current) {
        window.clearTimeout(dragDelayTimerRef.current);
      }
    };
  }, []);
  
  return {
    DragDropProvider: ({ children }: { children: React.ReactNode }) => (
      <DragDropContext.Provider value={contextValue}>
        {children}
      </DragDropContext.Provider>
    ),
    ...contextValue,
  };
}

// Helper hooks for use within components
export function useDroppable(droppableId: string) {
  const context = React.useContext(DragDropContext);
  if (!context) {
    throw new Error('useDroppable must be used within a DragDropProvider');
  }
  
  const { getDroppableProps, items, draggingId, dropzoneClassName } = context;
  const isDraggingOver = React.useMemo(() => {
    return !!draggingId && droppableId !== draggingId;
  }, [draggingId, droppableId]);
  
  return {
    droppableProps: getDroppableProps(droppableId),
    items: items[droppableId] || [],
    isDraggingOver,
    className: dropzoneClassName(isDraggingOver),
  };
}

export function useDraggable(item: DraggableItem, index: number, droppableId: string) {
  const context = React.useContext(DragDropContext);
  if (!context) {
    throw new Error('useDraggable must be used within a DragDropProvider');
  }
  
  const { getDraggableProps, draggingId, draggableClassName } = context;
  const isDragging = draggingId === item.id;
  
  return {
    draggableProps: getDraggableProps(item, index, droppableId),
    isDragging,
    className: draggableClassName(isDragging),
  };
}

export default useDragDrop;