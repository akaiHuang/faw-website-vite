import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';
import { useState, useRef, type FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SHADER_CONFIG_BASE, SCROLL_ROTATION_DEFAULTS, CAMERA_ZOOM } from '../config/shaderConfig';
import { useShaderConfig } from '../context/ShaderConfigContext';

// Keys to strip from ShaderGradient props (handled via direct mesh manipulation)
const MESH_TRANSFORM_KEYS = ['rotationX', 'rotationY', 'rotationZ', 'positionX', 'positionY', 'positionZ'];

// Inner component that controls mesh rotation/position via useFrame
const RotatingShaderGradient: FC<{ config: Record<string, unknown>; disableScrollRotation?: boolean }> = ({ config, disableScrollRotation = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene, invalidate } = useThree();
  const frameCount = useRef(0);
  const configRef = useRef(config);
  configRef.current = config;

  const targetValues = useRef({
    rotationX: SCROLL_ROTATION_DEFAULTS.initialRotationX,
    rotationZ: SCROLL_ROTATION_DEFAULTS.initialRotationZ,
    positionZ: 0,
    positionY: 0,
  });

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;

    if (!meshRef.current) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          meshRef.current = child;
        }
      });
    }

    if (meshRef.current) {
      if (disableScrollRotation) {
        // Editor mode: apply config values with proper degree-to-radian conversion
        const c = configRef.current;
        meshRef.current.rotation.x = THREE.MathUtils.degToRad(Number(c.rotationX) || 0);
        meshRef.current.rotation.y = THREE.MathUtils.degToRad(Number(c.rotationY) || 0);
        meshRef.current.rotation.z = THREE.MathUtils.degToRad(Number(c.rotationZ) || 0);
        meshRef.current.position.x = Number(c.positionX) || 0;
        meshRef.current.position.y = Number(c.positionY) || 0;
        meshRef.current.position.z = Number(c.positionZ) || 0;
      } else {
        // Production mode: scroll-based rotation
        const scrollDistance = window.innerHeight * SCROLL_ROTATION_DEFAULTS.scrollDistanceFactor;
        const progress = Math.min(window.scrollY / scrollDistance, 1);

        const { initialRotationX, initialRotationZ, targetRotationX, targetRotationZ, maxPositionZ, maxPositionY } = SCROLL_ROTATION_DEFAULTS;
        targetValues.current.rotationX = initialRotationX + (targetRotationX - initialRotationX) * progress;
        targetValues.current.rotationZ = initialRotationZ + (targetRotationZ - initialRotationZ) * progress;
        targetValues.current.positionZ = progress * maxPositionZ;
        targetValues.current.positionY = progress * maxPositionY;

        meshRef.current.rotation.x = THREE.MathUtils.degToRad(targetValues.current.rotationX);
        meshRef.current.rotation.z = THREE.MathUtils.degToRad(targetValues.current.rotationZ);
        meshRef.current.position.z = targetValues.current.positionZ;
        meshRef.current.position.y = targetValues.current.positionY;
      }
    }

    invalidate();
  });

  // Strip rotation/position from ShaderGradient props to avoid conflict with mesh manipulation
  const shaderProps = Object.fromEntries(
    Object.entries(config).filter(([key]) => !MESH_TRANSFORM_KEYS.includes(key))
  );

  return <ShaderGradient {...shaderProps} />;
};

export const ShaderBackground: FC = () => {
  const { configOverride } = useShaderConfig();

  const [isMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const overrideObj = configOverride as Record<string, unknown> | null;
  const defaultZoom = isMobile ? CAMERA_ZOOM.mobile : CAMERA_ZOOM.desktop;

  const mergedConfig = {
    ...SHADER_CONFIG_BASE,
    ...configOverride,
    cameraZoom: overrideObj?.cameraZoom != null ? (overrideObj.cameraZoom as number) : defaultZoom,
  };

  return (
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <ShaderGradientCanvas
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: 'transparent',
        }}
        pixelDensity={Math.min(window.devicePixelRatio, 1.5)}
      >
        <RotatingShaderGradient config={mergedConfig} disableScrollRotation={configOverride !== null} />
      </ShaderGradientCanvas>
    </div>
  );
};

export default ShaderBackground;
