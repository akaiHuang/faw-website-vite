import { useRef, useEffect, type FC, type CSSProperties } from 'react';

interface CylinderGridProps {
  className?: string;
  style?: CSSProperties;
}

export const CylinderGrid: FC<CylinderGridProps> = ({ className = '', style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const scrollProgress = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader - 上下變形的滾筒效果
    const fragmentShaderSource = `
      precision highp float;
      
      uniform vec2 u_resolution;
      uniform float u_scroll;
      uniform float u_time;
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        
        // 格子基礎參數
        float baseGridSize = 45.0;
        
        // ===== 限制在視窗 60% 高度範圍內 =====
        // 中心區域：0.2 ~ 0.8 (60% 的範圍)
        float topBound = 0.8;
        float bottomBound = 0.2;
        float rangeHeight = topBound - bottomBound; // 0.6
        
        // 將 uv.y 映射到 0~1 範圍內（在60%區域內）
        float normalizedY = (uv.y - bottomBound) / rangeHeight;
        
        // 超出範圍則完全透明
        if (uv.y < bottomBound || uv.y > topBound) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }
        
        // ===== 3D 滾筒變形 (只有 Y 軸高度變化) =====
        // 計算與中心的距離 (0 = 中心, 1 = 邊緣)
        float centerDist = abs(normalizedY - 0.5) * 2.0;
        
        // 更強烈的圓柱曲面 - 邊緣壓縮更極端
        float cylinderCurve = cos(centerDist * 1.5708); // PI/2
        cylinderCurve = pow(max(0.0, cylinderCurve), 0.7);
        
        // Y軸縮放：中間膨脹 1.3x，邊緣壓縮到 0.05x
        float scaleY = mix(0.05, 1.3, cylinderCurve);
        
        // X 軸不變形
        float scaledX = uv.x;
        
        // 滾動偏移 - 讓格子隨頁面滾動
        float scrollOffset = u_scroll * 2.5;
        
        // Y 軸變形 - 從中心計算，加入滾動
        float distFromCenter = normalizedY - 0.5;
        float scaledY = distFromCenter / scaleY + 0.5 + scrollOffset;
        
        // 計算格子座標
        vec2 gridCoord = vec2(
          scaledX * u_resolution.x,
          scaledY * u_resolution.y * rangeHeight
        );
        
        // 格子大小固定
        float gridSize = baseGridSize;
        
        // 計算格子線條
        vec2 gridFract = fract(gridCoord / gridSize);
        vec2 gridLines = abs(gridFract - 0.5);
        
        // 線條寬度 - 中間稍粗，邊緣很細
        float lineWidth = 0.02 * mix(0.3, 1.0, cylinderCurve);
        
        // 平滑線條
        float hLine = smoothstep(lineWidth, lineWidth * 0.15, gridLines.y);
        float vLine = smoothstep(lineWidth, lineWidth * 0.15, gridLines.x);
        float line = max(hLine, vLine);
        
        // ===== 深度著色 - 中間亮，邊緣暗 =====
        float depthShading = mix(0.1, 1.0, cylinderCurve);
        
        // ===== 邊緣收黑 - 漸變到完全透明 =====
        // 使用更強的淡出曲線
        float edgeFade = pow(cylinderCurve, 1.5);
        
        // 額外的上下邊緣淡出
        float topFade = smoothstep(topBound, topBound - 0.08, uv.y);
        float bottomFade = smoothstep(bottomBound, bottomBound + 0.08, uv.y);
        float boundaryFade = topFade * bottomFade;
        
        // 微弱呼吸效果
        float breathe = sin(u_time * 0.3) * 0.03 + 1.0;
        
        // 最終 alpha - 邊緣收黑效果
        float alpha = line * edgeFade * depthShading * boundaryFade * 0.18 * breathe;
        
        // 顏色 - 中間亮，邊緣暗
        vec3 baseColor = vec3(0.024, 0.714, 0.831);
        vec3 color = baseColor * (0.5 + cylinderCurve * 0.6);
        
        gl_FragColor = vec4(color, alpha);
      }
    `;

    // 編譯 shader
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    // 創建程式
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // 創建全螢幕四邊形
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // 獲取 uniform 位置
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const scrollLoc = gl.getUniformLocation(program, 'u_scroll');
    const timeLoc = gl.getUniformLocation(program, 'u_time');

    // 啟用混合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 設置畫布大小
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    // 滾動處理 - 計算區域內的進度
    const handleScroll = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // 計算這個區域在視窗中的位置進度
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      scrollProgress.current = Math.max(0, Math.min(1, progress));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 渲染循環
    const render = (time: number) => {
      // 節流到約 30fps
      if (time - lastTime.current < 33) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastTime.current = time;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(scrollLoc, scrollProgress.current);
      gl.uniform1f(timeLoc, time * 0.001);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0, ...style }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
};

export default CylinderGrid;
