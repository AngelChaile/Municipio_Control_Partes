import React from "react";

export default function ResetButton({ onReset }) {
  return (
    <button className="reset" onClick={onReset}>Vaciar todo</button>
  );
}
