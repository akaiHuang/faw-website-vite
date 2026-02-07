import { type FC } from 'react';
import type { ShaderConfigBase } from '../../config/shaderConfig';

export interface Keyframe {
  id: string;
  scrollProgress: number; // 0 to 1 (0% ~ 100% scroll)
  config: ShaderConfigBase & { cameraZoom: number };
  label?: string;
}

interface KeyframeTimelineProps {
  keyframes: Keyframe[];
  scrollProgress: number;
  selectedId: string | null;
  isPreview: boolean;
  onAddKeyframe: () => void;
  onRemoveKeyframe: (id: string) => void;
  onSelectKeyframe: (id: string) => void;
  onUpdateKeyframe: () => void;
  onTogglePreview: () => void;
}

// Lerp utilities
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const NUMERIC_KEYS: (keyof ShaderConfigBase)[] = [
  'uSpeed', 'uAmplitude', 'uDensity', 'uFrequency', 'uStrength',
  'rangeStart', 'rangeEnd', 'brightness', 'reflection',
  'cDistance', 'cAzimuthAngle', 'cPolarAngle', 'fov',
  'positionX', 'positionY', 'positionZ',
  'rotationX', 'rotationY', 'rotationZ',
  'pixelDensity',
];

const COLOR_KEYS: (keyof ShaderConfigBase)[] = ['color1', 'color2', 'color3'];
const STRING_KEYS: (keyof ShaderConfigBase)[] = ['type', 'animate', 'range', 'grain', 'lightType', 'envPreset'];

export function interpolateKeyframes(
  keyframes: Keyframe[],
  scrollProgress: number,
  fallbackConfig: ShaderConfigBase & { cameraZoom: number }
): ShaderConfigBase & { cameraZoom: number } {
  if (keyframes.length === 0) return fallbackConfig;

  const sorted = [...keyframes].sort((a, b) => a.scrollProgress - b.scrollProgress);

  // Before first keyframe
  if (scrollProgress <= sorted[0].scrollProgress) return { ...sorted[0].config };

  // After last keyframe
  if (scrollProgress >= sorted[sorted.length - 1].scrollProgress) return { ...sorted[sorted.length - 1].config };

  // Find surrounding keyframes
  let prev = sorted[0];
  let next = sorted[1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (scrollProgress >= sorted[i].scrollProgress && scrollProgress <= sorted[i + 1].scrollProgress) {
      prev = sorted[i];
      next = sorted[i + 1];
      break;
    }
  }

  const range = next.scrollProgress - prev.scrollProgress;
  const t = range > 0 ? (scrollProgress - prev.scrollProgress) / range : 0;

  const result = { ...prev.config };

  // Interpolate numeric values
  for (const key of NUMERIC_KEYS) {
    (result as Record<string, unknown>)[key] = lerp(
      prev.config[key] as number,
      next.config[key] as number,
      t
    );
  }

  // Interpolate cameraZoom
  result.cameraZoom = lerp(prev.config.cameraZoom, next.config.cameraZoom, t);

  // Interpolate colors
  for (const key of COLOR_KEYS) {
    (result as Record<string, unknown>)[key] = lerpColor(
      prev.config[key] as string,
      next.config[key] as string,
      t
    );
  }

  // Snap string/enum values to nearest keyframe
  for (const key of STRING_KEYS) {
    (result as Record<string, unknown>)[key] = t < 0.5 ? prev.config[key] : next.config[key];
  }

  return result;
}

const btnStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '4px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: '#e5e5e5',
  fontSize: '11px',
  cursor: 'pointer',
  fontFamily: 'monospace',
};

const btnPrimaryStyle: React.CSSProperties = {
  ...btnStyle,
  borderColor: '#06b6d4',
  background: 'rgba(6,182,212,0.15)',
  color: '#06b6d4',
};

const btnActiveStyle: React.CSSProperties = {
  ...btnStyle,
  borderColor: '#10b981',
  background: 'rgba(16,185,129,0.2)',
  color: '#10b981',
};

export const KeyframeTimeline: FC<KeyframeTimelineProps> = ({
  keyframes,
  scrollProgress,
  selectedId,
  isPreview,
  onAddKeyframe,
  onRemoveKeyframe,
  onSelectKeyframe,
  onUpdateKeyframe,
  onTogglePreview,
}) => {
  const sorted = [...keyframes].sort((a, b) => a.scrollProgress - b.scrollProgress);
  const pct = (scrollProgress * 100).toFixed(1);

  return (
    <div style={{ marginTop: '12px' }}>
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '10px',
          marginBottom: '8px',
          color: '#06b6d4',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Scroll Keyframes
      </div>

      {/* Timeline bar */}
      <div
        style={{
          position: 'relative',
          height: '32px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '8px',
        }}
      >
        {/* Playhead (current scroll position) */}
        <div
          style={{
            position: 'absolute',
            left: `${scrollProgress * 100}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#06b6d4',
            zIndex: 2,
            transition: 'left 0.1s',
          }}
        />

        {/* Keyframe markers */}
        {sorted.map((kf) => (
          <div
            key={kf.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectKeyframe(kf.id);
            }}
            title={`${(kf.scrollProgress * 100).toFixed(1)}%${kf.label ? ` - ${kf.label}` : ''}`}
            style={{
              position: 'absolute',
              left: `${kf.scrollProgress * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: '10px',
              height: '10px',
              background: selectedId === kf.id ? '#06b6d4' : '#f59e0b',
              border: `1px solid ${selectedId === kf.id ? '#22d3ee' : '#fbbf24'}`,
              borderRadius: '2px',
              zIndex: 3,
              cursor: 'pointer',
            }}
          />
        ))}

        {/* Scale labels */}
        <span style={{ position: 'absolute', left: '2px', bottom: '1px', fontSize: '8px', color: '#4b5563' }}>0%</span>
        <span style={{ position: 'absolute', right: '2px', bottom: '1px', fontSize: '8px', color: '#4b5563' }}>100%</span>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={onTogglePreview}
          style={isPreview ? btnActiveStyle : btnPrimaryStyle}
        >
          {isPreview ? '● Preview ON' : '○ Preview OFF'}
        </button>
        <button onClick={onAddKeyframe} style={btnPrimaryStyle}>
          + KF at {pct}%
        </button>
        {selectedId && (
          <button onClick={onUpdateKeyframe} style={{ ...btnStyle, borderColor: '#f59e0b', background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            Update Selected
          </button>
        )}
        <span style={{ color: '#6b7280', fontSize: '10px', fontFamily: 'monospace', marginLeft: 'auto' }}>
          Scroll: {pct}%
        </span>
      </div>

      {/* Keyframe list */}
      {sorted.length > 0 && (
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {sorted.map((kf) => (
            <div
              key={kf.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: selectedId === kf.id ? 'rgba(6,182,212,0.08)' : 'transparent',
                borderRadius: '2px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  background: selectedId === kf.id ? '#06b6d4' : '#f59e0b',
                  transform: 'rotate(45deg)',
                  borderRadius: '1px',
                  flexShrink: 0,
                }}
              />
              <span
                style={{ color: selectedId === kf.id ? '#06b6d4' : '#9ca3af', fontSize: '10px', cursor: 'pointer', flex: 1 }}
                onClick={() => onSelectKeyframe(kf.id)}
              >
                {(kf.scrollProgress * 100).toFixed(1)}%{kf.label ? ` - ${kf.label}` : ''}
              </span>
              <button
                onClick={() => onRemoveKeyframe(kf.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0 4px',
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyframeTimeline;
