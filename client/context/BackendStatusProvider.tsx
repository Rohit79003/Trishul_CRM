"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import backendStatusService, { BackendStatusState } from "@/services/backendStatus";

interface BackendStatusContextType extends BackendStatusState {
  checkBackend: () => Promise<boolean>;
  retry: () => Promise<boolean>;
}

const BackendStatusContext = createContext<BackendStatusContextType | undefined>(undefined);

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [statusState, setStatusState] = useState<BackendStatusState>(() => backendStatusService.getState());

  useEffect(() => {
    // Subscribe to service state changes
    const unsubscribe = backendStatusService.subscribe((newState) => {
      setStatusState(newState);
    });

    // Run initial health check on application mount
    backendStatusService.checkHealth();

    return () => {
      unsubscribe();
    };
  }, []);

  const checkBackend = useCallback(async () => {
    return backendStatusService.checkHealth();
  }, []);

  const retry = useCallback(async () => {
    return backendStatusService.retry();
  }, []);

  const value = useMemo(
    () => ({
      ...statusState,
      checkBackend,
      retry,
    }),
    [statusState, checkBackend, retry]
  );

  return (
    <BackendStatusContext.Provider value={value}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = (): BackendStatusContextType => {
  const context = useContext(BackendStatusContext);
  if (!context) {
    throw new Error("useBackendStatus must be used within a BackendStatusProvider");
  }
  return context;
};
