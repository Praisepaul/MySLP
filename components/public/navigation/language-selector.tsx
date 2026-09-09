"use client";

import { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
];

export function LanguageSelector() {
  const [language, setLanguage] = useState("en");

  return (
    <label className="sr-only">
      Select language
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className="rounded-md border bg-background px-2 py-1 text-sm"
        aria-label="Select language"
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
