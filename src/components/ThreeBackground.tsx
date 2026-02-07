import { useEffect, useRef, type FC } from 'react';
import * as THREE from 'three';

export const ThreeBackground: FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid Shaders
    const gridVertexShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const gridFragmentShader = `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      
      void main() {
        vec2 grid = abs(fract(vUv * 30.0 - 0.5) - 0.5) / fwidth(vUv * 30.0);
        float line = min(grid.x, grid.y);
        float gridPattern = 1.0 - min(line, 1.0);
        
        float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
        
        vec3 color1 = vec3(0.024, 0.714, 0.831);
        vec3 color2 = vec3(0.659, 0.333, 0.969);
        vec3 baseColor = mix(color1, color2, vUv.x + sin(uTime * 0.3) * 0.2);
        
        vec3 finalColor = baseColor * gridPattern * (0.15 + pulse * 0.1);
        float alpha = gridPattern * 0.25;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // Create flowing grid plane
    const gridGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    const gridMaterial = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = -Math.PI * 0.4;
    gridMesh.position.y = -15;
    gridMesh.position.z = -20;
    scene.add(gridMesh);

    // Floating particles
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const color = Math.random() > 0.5 
        ? new THREE.Color(0x06b6d4)
        : new THREE.Color(0xa855f7);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleVertexShader = `
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uTime;
      
      void main() {
        vColor = color;
        vec3 pos = position;
        pos.y += sin(uTime * 0.5 + position.x * 0.1) * 2.0;
        pos.x += cos(uTime * 0.3 + position.z * 0.1) * 1.5;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 3.0 * (30.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const particleFragmentShader = `
      varying vec3 vColor;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * 0.6);
      }
    `;

    const particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Mouse interaction
    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    const handleMouseMove = (event: MouseEvent) => {
      targetMouseX = event.clientX / window.innerWidth;
      targetMouseY = 1.0 - event.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      gridMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uTime.value = time;

      camera.position.x += ((mouseX - 0.5) * 10 - camera.position.x) * 0.02;
      camera.position.y += ((mouseY - 0.5) * 5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, -10);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        opacity: 1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default ThreeBackground;
