"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import loadingService from "@/lib/LoadingService";

interface LoadingContextType {
  isGlobalLoading: boolean;
  activeRequestCount: number;
}

const LoadingContext = createContext<LoadingContextType>({
  isGlobalLoading: false,
  activeRequestCount: 0,
});

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [activeRequestCount, setActiveRequestCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = loadingService.subscribe((isLoading, activeCount) => {
      setIsGlobalLoading(isLoading);
      setActiveRequestCount(activeCount);
    });

    return () => unsubscribe();
  }, []);

  return (
    <LoadingContext.Provider value={{ isGlobalLoading, activeRequestCount }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
export default LoadingContext;
