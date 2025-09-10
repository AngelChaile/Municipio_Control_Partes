import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <input className="search" placeholder="Buscar por nombre o cod..." value={value} onChange={e => onChange(e.target.value)} />
  );
}
