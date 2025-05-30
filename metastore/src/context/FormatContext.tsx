import React, { createContext, useContext, useState } from "react";

export interface FormatContextType {
  format: string;
  setFormat: (newFormat: string) => void;
}

// Create the context with default values
const FormatContext = createContext<FormatContextType | undefined>(undefined);

// Provider Component
export const FormatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [format, setFormat] = useState("iceberg");

  return (
    <FormatContext.Provider value={{ format, setFormat }}>
      {children}
    </FormatContext.Provider>
  );
};

// Custom hook for easy access
export const useFormat = () => {
  const context = useContext(FormatContext);
  if (!context) {
    throw new Error("useFormat must be used within a FormatProvider");
  }
  return context;
};
