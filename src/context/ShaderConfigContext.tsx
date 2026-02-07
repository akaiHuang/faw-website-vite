import { createContext, useContext } from 'react';
import type { ShaderConfigBase } from '../config/shaderConfig';

interface ShaderConfigContextValue {
  configOverride: Partial<ShaderConfigBase> | null;
}

const ShaderConfigContext = createContext<ShaderConfigContextValue>({
  configOverride: null,
});

export const ShaderConfigProvider = ShaderConfigContext.Provider;
export const useShaderConfig = () => useContext(ShaderConfigContext);
