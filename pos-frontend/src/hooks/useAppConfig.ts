import { useCallback, useEffect, useState } from 'react';
import { AppConfig, applyAppConfigToDocument, loadAppConfig } from '../utils/appConfig';

export const useAppConfig = (): AppConfig => {
  const [config, setConfig] = useState<AppConfig>(() => loadAppConfig());

  const reloadConfig = useCallback(() => {
    setConfig(loadAppConfig());
  }, []);

  useEffect(() => {
    globalThis.addEventListener('configAppUpdate', reloadConfig);
    globalThis.addEventListener('storage', reloadConfig);

    return () => {
      globalThis.removeEventListener('configAppUpdate', reloadConfig);
      globalThis.removeEventListener('storage', reloadConfig);
    };
  }, [reloadConfig]);

  useEffect(() => {
    applyAppConfigToDocument(config);
  }, [config]);

  return config;
};
