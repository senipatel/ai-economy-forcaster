import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';

interface CountryContextType {
  country: string;
  setCountry: (country: string) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [country, setCountryState] = useState<string>(() => {
    // Get the initial country from localStorage or default to 'USA'
    return localStorage.getItem('selectedCountry') || 'USA';
  });

  useEffect(() => {
    // Persist the selected country to localStorage whenever it changes
    localStorage.setItem('selectedCountry', country);
  }, [country]);

  const setCountry = (newCountry: string) => {
    setCountryState(newCountry);
  };

  const value = useMemo(() => ({ country, setCountry }), [country]);

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextType => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};