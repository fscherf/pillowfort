import React, { createContext, useContext, useState, ReactNode } from "react";

type Values = Record<string, any>;

type StorageContextType = {
  reset: () => void;
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  toggle: (key: string) => void;
};

const localStorageKeyName = "pillowfort.storage.v1";
const StorageContext = createContext<StorageContextType | undefined>(undefined);

function getInitialValues() {
  return {
    "overlay.open": false,
    "game.showFps": false,
    "game.showTps": false,
    "game.showCorners": false,
    "game.cursorEnabled": false,
  };
}

function load() {
  try {
    const valueString = localStorage.getItem(localStorageKeyName);

    if (valueString) {
      return JSON.parse(valueString);
    }

    return getInitialValues();
  } catch (err) {
    console.error("Failed to load state from localStorage:", err);

    return getInitialValues();
  }
}

function save(values) {
  try {
    localStorage.setItem(localStorageKeyName, JSON.stringify(values));
  } catch (err) {
    console.error("Failed to save state to localStorage:", err);
  }
}

export function Storage({ children }: { children: ReactNode }) {
  const [values, setValues] = useState<Values>(() => load());

  const reset = () => {
    setValues((previousValues) => {
      return getInitialValues();
    });
  };

  const get = (key) => {
    return values[key];
  };

  const set = (key, value) => {
    setValues((previousValues) => {
      const newValues = { ...previousValues, [key]: value };

      save(newValues);

      return newValues;
    });
  };

  const toggle = (key) => {
    setValues((previousValues) => {
      const newValues = { ...previousValues, [key]: !previousValues[key] };

      save(newValues);

      return newValues;
    });
  };

  return (
    <StorageContext.Provider value={{ reset, get, set, toggle }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const storageContext = useContext(StorageContext);

  if (!StorageContext) {
    throw new Error("useStorage must be used within Storage provider");
  }

  return storageContext;
}
