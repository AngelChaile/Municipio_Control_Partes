import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-container">
      <i className="fas fa-search"></i>
      <input 
        className="search" 
        placeholder="Buscar..." 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}