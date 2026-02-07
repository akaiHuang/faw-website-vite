import { useState, useRef, useEffect, useCallback, type FC, type ReactNode } from 'react';

interface DraggablePanelProps {
  title: string;
  children: ReactNode;
  storageKey?: string;
  defaultPosition?: { x: number; y: number };
}

export const DraggablePanel: FC<DraggablePanelProps> = ({
  title,
  children,
  storageKey = 'draggable-panel-pos',
  defaultPosition = { x: 20, y: 80 },
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return defaultPosition;
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Save position to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(position));
    } catch { /* ignore */ }
  }, [position, storageKey]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 99999,
        width: collapsed ? 'auto' : '380px',
        maxHeight: collapsed ? 'auto' : '85vh',
        background: 'rgba(10, 10, 10, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#e5e5e5',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title bar - drag handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          padding: '8px 12px',
          background: 'rgba(6, 182, 212, 0.1)',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: collapsed ? '12px' : '12px 12px 0 0',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#06b6d4', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '2px 8px',
            fontSize: '11px',
            lineHeight: '1.4',
          }}
        >
          {collapsed ? '+' : '-'}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '12px',
            flex: 1,
            minHeight: 0,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DraggablePanel;
