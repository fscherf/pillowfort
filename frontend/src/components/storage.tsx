import React from "react";

import { useStorage } from "@/providers/storage";

export function Toggle({ title, storageKey }) {
  const storage = useStorage();
  const checked = storage.get(storageKey);

  const handleChange = () => {
    storage.toggle(storageKey);
  };

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        userSelect: "none",
      }}
    >
      <input type="checkbox" checked={checked} onChange={handleChange} />
      {title}
    </label>
  );
}
