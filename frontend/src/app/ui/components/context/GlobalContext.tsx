// app/context/GlobalContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type GlobalContextType = {
  cash: string;
  setCash: (currency: string) => void;
  rate: number;
  setRate: (rate: number) => void;
  // Agrega aquí más estados globales
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [cash, setCash] = useState("");
  const [rate, setRate] = useState(0);

  return (
    <GlobalContext.Provider value={ { cash, setCash, rate, setRate } }>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}