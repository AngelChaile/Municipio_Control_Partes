import React from "react";

export default function ResetButton({ onReset }) {
  return (
    <button className="reset" onClick={onReset}>
      <i className="fas fa-eraser"></i>
      Vaciar todo
    </button>
  );
}