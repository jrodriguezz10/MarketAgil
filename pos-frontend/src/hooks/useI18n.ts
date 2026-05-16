import { enUS, es as esLocale } from 'date-fns/locale';
import { useCallback } from 'react';
import { useAppConfig } from './useAppConfig';

export const useI18n = () => {
  const { idioma } = useAppConfig();
  const isEnglish = idioma === 'en';
  const t = useCallback(
    (spanishText: string, englishText: string) => (isEnglish ? englishText : spanishText),
    [isEnglish]
  );

  return {
    idioma,
    isEnglish,
    localeCode: isEnglish ? 'en-US' : 'es-PE',
    dateLocale: isEnglish ? enUS : esLocale,
    t
  };
};
