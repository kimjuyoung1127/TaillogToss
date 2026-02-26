import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import type { SurveyData } from 'types/dog';

interface SurveyContextValue {
  surveyData: SurveyData | null;
  setSurveyData: (data: SurveyData) => void;
  clearSurveyData: () => void;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [surveyData, setSurveyDataState] = useState<SurveyData | null>(null);

  const setSurveyData = useCallback((data: SurveyData) => {
    setSurveyDataState(data);
  }, []);

  const clearSurveyData = useCallback(() => {
    setSurveyDataState(null);
  }, []);

  const value = useMemo(
    () => ({ surveyData, setSurveyData, clearSurveyData }),
    [surveyData, setSurveyData, clearSurveyData]
  );

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
}

export function useSurvey(): SurveyContextValue {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}
