import { useState, useCallback, useEffect } from 'react';
import { SHADER_CONFIG_BASE, CAMERA_ZOOM, type ShaderConfigBase } from '../config/shaderConfig';
import { ShaderConfigProvider } from '../context/ShaderConfigContext';
import { DraggablePanel } from '../components/editor/DraggablePanel';
import { ShaderControls } from '../components/editor/ShaderControls';
import { KeyframeTimeline, interpolateKeyframes, type Keyframe } from '../components/editor/KeyframeTimeline';
import App from '../App';

type FullConfig = ShaderConfigBase & { cameraZoom: number };

const defaultFullConfig: FullConfig = {
  ...SHADER_CONFIG_BASE,
  cameraZoom: CAMERA_ZOOM.desktop,
};

function ShaderEditor() {
  const [config, setConfig] = useState<FullConfig>({ ...defaultFullConfig });
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 1));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interpolate on scroll when preview is on
  useEffect(() => {
    if (isPreview && keyframes.length >= 2) {
      setConfig((prev) => interpolateKeyframes(keyframes, scrollProgress, prev));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollProgress, isPreview, keyframes]);

  const handleParamChange = useCallback((key: string, value: number | string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleAddKeyframe = useCallback(() => {
    const kf: Keyframe = {
      id: `kf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      scrollProgress,
      config: { ...config },
    };
    setKeyframes((prev) => [...prev, kf]);
    setSelectedKeyframeId(null);
  }, [scrollProgress, config]);

  const handleRemoveKeyframe = useCallback((id: string) => {
    setKeyframes((prev) => prev.filter((kf) => kf.id !== id));
    setSelectedKeyframeId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSelectKeyframe = useCallback((id: string) => {
    const kf = keyframes.find((k) => k.id === id);
    if (kf) {
      setSelectedKeyframeId(id);
      if (!isPreview) {
        setConfig({ ...kf.config });
      }
      // Scroll to the keyframe's scroll position
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: kf.scrollProgress * maxScroll, behavior: 'smooth' });
    }
  }, [keyframes, isPreview]);

  const handleUpdateKeyframe = useCallback(() => {
    if (!selectedKeyframeId) return;
    setKeyframes((prev) =>
      prev.map((kf) =>
        kf.id === selectedKeyframeId
          ? { ...kf, config: { ...config } }
          : kf
      )
    );
  }, [selectedKeyframeId, config]);

  const handleTogglePreview = useCallback(() => {
    setIsPreview((prev) => !prev);
    setSelectedKeyframeId(null);
  }, []);

  const handleExportJSON = useCallback(async () => {
    const exportData = {
      shaderConfig: { ...config },
      keyframes: keyframes.map((kf) => ({
        scrollProgress: kf.scrollProgress,
        config: kf.config,
        label: kf.label,
      })),
      cameraZoom: {
        desktop: CAMERA_ZOOM.desktop,
        mobile: CAMERA_ZOOM.mobile,
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create a downloadable blob
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shader-config.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [config, keyframes]);

  const handleReset = useCallback(() => {
    setConfig({ ...defaultFullConfig });
    setKeyframes([]);
    setIsPreview(false);
    setSelectedKeyframeId(null);
  }, []);

  // Build the context override: pass all config including cameraZoom as extra field
  const contextValue = {
    configOverride: { ...config } as Partial<ShaderConfigBase> & Record<string, unknown>,
  };

  return (
    <ShaderConfigProvider value={contextValue}>
      {/* Render the full App behind the editor panel */}
      <App skipLoading />

      {/* Editor control panel */}
      <DraggablePanel title="Shader Editor" storageKey="shader-editor-panel-pos">
        <ShaderControls config={config} onChange={handleParamChange} />

        <KeyframeTimeline
          keyframes={keyframes}
          scrollProgress={scrollProgress}
          selectedId={selectedKeyframeId}
          isPreview={isPreview}
          onAddKeyframe={handleAddKeyframe}
          onRemoveKeyframe={handleRemoveKeyframe}
          onSelectKeyframe={handleSelectKeyframe}
          onUpdateKeyframe={handleUpdateKeyframe}
          onTogglePreview={handleTogglePreview}
        />

        {/* Action buttons */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '10px',
            marginTop: '10px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleExportJSON}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #06b6d4',
              background: 'rgba(6,182,212,0.2)',
              color: '#06b6d4',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {copied ? 'Copied!' : 'Export JSON'}
          </button>
          <button
            onClick={handleReset}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'monospace',
            }}
          >
            Reset
          </button>
        </div>
      </DraggablePanel>
    </ShaderConfigProvider>
  );
}

export default ShaderEditor;
