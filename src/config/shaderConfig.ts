// Shader configuration - centralized parameters, types, and defaults

export interface ShaderConfigBase {
  type: 'plane' | 'sphere' | 'waterPlane';
  animate: 'on' | 'off';
  uSpeed: number;
  uAmplitude: number;
  uDensity: number;
  uFrequency: number;
  uStrength: number;
  range: string;
  rangeStart: number;
  rangeEnd: number;
  color1: string;
  color2: string;
  color3: string;
  brightness: number;
  grain: 'on' | 'off';
  lightType: '3d' | 'env';
  envPreset: 'city' | 'dawn' | 'lobby';
  reflection: number;
  cDistance: number;
  cAzimuthAngle: number;
  cPolarAngle: number;
  fov: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  pixelDensity: number;
}

export const SHADER_CONFIG_BASE: ShaderConfigBase = {
  type: 'waterPlane',
  animate: 'on',
  uSpeed: 0.4,
  uAmplitude: 1,
  uDensity: 1.3,
  uFrequency: 5.5,
  uStrength: 4,
  range: 'disabled',
  rangeStart: 0,
  rangeEnd: 40,
  color1: '#8fafc7',
  color2: '#ddd1d1',
  color3: '#81adb8',
  brightness: 1.2,
  grain: 'on',
  lightType: '3d',
  envPreset: 'city',
  reflection: 0.1,
  cDistance: 10,
  cAzimuthAngle: 0,
  cPolarAngle: 0,
  fov: 0,
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  pixelDensity: 5.2,
};

export const SCROLL_ROTATION_DEFAULTS = {
  initialRotationX: 90,
  initialRotationZ: 90,
  targetRotationX: 10,
  targetRotationZ: 5,
  scrollDistanceFactor: 0.4, // fraction of window.innerHeight
  maxPositionZ: 2,
  maxPositionY: 10,
};

export const CAMERA_ZOOM = {
  desktop: 12,
  mobile: 6,
};

// Slider ranges for the editor UI
export interface ParamRange {
  min: number;
  max: number;
  step: number;
}

export const PARAM_RANGES: Record<string, ParamRange> = {
  uSpeed: { min: 0, max: 3, step: 0.05 },
  uAmplitude: { min: 0, max: 10, step: 0.1 },
  uDensity: { min: 0, max: 10, step: 0.1 },
  uFrequency: { min: 0, max: 15, step: 0.1 },
  uStrength: { min: 0, max: 15, step: 0.1 },
  rangeStart: { min: 0, max: 100, step: 1 },
  rangeEnd: { min: 0, max: 100, step: 1 },
  brightness: { min: 0, max: 5, step: 0.1 },
  reflection: { min: 0, max: 1, step: 0.01 },
  cDistance: { min: 0.1, max: 30, step: 0.1 },
  cAzimuthAngle: { min: -180, max: 180, step: 1 },
  cPolarAngle: { min: -180, max: 180, step: 1 },
  fov: { min: 0, max: 120, step: 1 },
  positionX: { min: -30, max: 30, step: 0.1 },
  positionY: { min: -30, max: 30, step: 0.1 },
  positionZ: { min: -30, max: 30, step: 0.1 },
  rotationX: { min: 0, max: 360, step: 1 },
  rotationY: { min: 0, max: 360, step: 1 },
  rotationZ: { min: 0, max: 360, step: 1 },
  pixelDensity: { min: 0.5, max: 10, step: 0.1 },
  cameraZoom: { min: 0.5, max: 30, step: 0.5 },
};
