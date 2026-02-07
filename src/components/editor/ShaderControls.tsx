import { type FC } from 'react';
import { PARAM_RANGES, type ShaderConfigBase } from '../../config/shaderConfig';

interface ShaderControlsProps {
  config: ShaderConfigBase & { cameraZoom: number };
  onChange: (key: string, value: number | string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '4px',
  appearance: 'none',
  WebkitAppearance: 'none',
  background: 'rgba(255,255,255,0.15)',
  borderRadius: '2px',
  outline: 'none',
  cursor: 'pointer',
  accentColor: '#06b6d4',
};

const SliderRow: FC<{
  label: string;
  paramKey: string;
  value: number;
  onChange: (key: string, value: number) => void;
}> = ({ label, paramKey, value, onChange }) => {
  const range = PARAM_RANGES[paramKey];
  if (!range) return null;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ color: '#9ca3af', fontSize: '11px' }}>{label}</span>
        <span style={{ color: '#06b6d4', fontSize: '11px', fontFamily: 'monospace' }}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(paramKey, parseFloat(e.target.value))}
        style={inputStyle}
      />
    </div>
  );
};

const ColorRow: FC<{
  label: string;
  paramKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
}> = ({ label, paramKey, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <span style={{ color: '#9ca3af', fontSize: '11px', minWidth: '50px' }}>{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(paramKey, e.target.value)}
      style={{
        width: '32px',
        height: '24px',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '4px',
        cursor: 'pointer',
        background: 'transparent',
        padding: 0,
      }}
    />
    <span style={{ color: '#6b7280', fontSize: '10px', fontFamily: 'monospace' }}>{value}</span>
  </div>
);

const SelectRow: FC<{
  label: string;
  paramKey: string;
  value: string;
  options: string[];
  onChange: (key: string, value: string) => void;
}> = ({ label, paramKey, value, options, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <span style={{ color: '#9ca3af', fontSize: '11px', minWidth: '70px' }}>{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(paramKey, e.target.value)}
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '4px',
        color: '#e5e5e5',
        fontSize: '11px',
        padding: '3px 6px',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} style={{ background: '#1a1a1a' }}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ToggleRow: FC<{
  label: string;
  paramKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
}> = ({ label, paramKey, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
    <span style={{ color: '#9ca3af', fontSize: '11px', minWidth: '70px' }}>{label}</span>
    <button
      onClick={() => onChange(paramKey, value === 'on' ? 'off' : 'on')}
      style={{
        padding: '2px 10px',
        borderRadius: '4px',
        border: '1px solid',
        borderColor: value === 'on' ? '#06b6d4' : 'rgba(255,255,255,0.15)',
        background: value === 'on' ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
        color: value === 'on' ? '#06b6d4' : '#6b7280',
        fontSize: '11px',
        cursor: 'pointer',
      }}
    >
      {value}
    </button>
  </div>
);

const SectionHeader: FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingTop: '10px',
      marginTop: '10px',
      marginBottom: '8px',
      color: '#06b6d4',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}
  >
    {label}
  </div>
);

export const ShaderControls: FC<ShaderControlsProps> = ({ config, onChange }) => {
  const handleNumChange = (key: string, value: number) => onChange(key, value);
  const handleStrChange = (key: string, value: string) => onChange(key, value);

  return (
    <div>
      <SectionHeader label="Shape" />
      <SelectRow label="Type" paramKey="type" value={config.type} options={['plane', 'sphere', 'waterPlane']} onChange={handleStrChange} />

      <SectionHeader label="Animation" />
      <ToggleRow label="Animate" paramKey="animate" value={config.animate} onChange={handleStrChange} />
      <SliderRow label="Speed" paramKey="uSpeed" value={config.uSpeed} onChange={handleNumChange} />

      <SectionHeader label="Deformation" />
      <SliderRow label="Density" paramKey="uDensity" value={config.uDensity} onChange={handleNumChange} />
      <SliderRow label="Frequency" paramKey="uFrequency" value={config.uFrequency} onChange={handleNumChange} />
      <SliderRow label="Strength" paramKey="uStrength" value={config.uStrength} onChange={handleNumChange} />

      <SectionHeader label="Colors" />
      <ColorRow label="Color 1" paramKey="color1" value={config.color1} onChange={handleStrChange} />
      <ColorRow label="Color 2" paramKey="color2" value={config.color2} onChange={handleStrChange} />
      <ColorRow label="Color 3" paramKey="color3" value={config.color3} onChange={handleStrChange} />

      <SectionHeader label="Lighting" />
      <ToggleRow label="Grain" paramKey="grain" value={config.grain} onChange={handleStrChange} />
      <SliderRow label="Reflection" paramKey="reflection" value={config.reflection} onChange={handleNumChange} />

      <SectionHeader label="Camera" />
      {config.type === 'sphere'
        ? <SliderRow label="Distance" paramKey="cDistance" value={config.cDistance} onChange={handleNumChange} />
        : <SliderRow label="Zoom" paramKey="cameraZoom" value={config.cameraZoom} onChange={handleNumChange} />
      }

      <SectionHeader label="Position" />
      <SliderRow label="X" paramKey="positionX" value={config.positionX} onChange={handleNumChange} />
      <SliderRow label="Y" paramKey="positionY" value={config.positionY} onChange={handleNumChange} />
      <SliderRow label="Z" paramKey="positionZ" value={config.positionZ} onChange={handleNumChange} />

      <SectionHeader label="Rotation" />
      <SliderRow label="X" paramKey="rotationX" value={config.rotationX} onChange={handleNumChange} />
      <SliderRow label="Y" paramKey="rotationY" value={config.rotationY} onChange={handleNumChange} />
      <SliderRow label="Z" paramKey="rotationZ" value={config.rotationZ} onChange={handleNumChange} />
    </div>
  );
};

export default ShaderControls;
