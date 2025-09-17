import React from "react";

const StatsCard = ({ title, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-600">{title}</h2>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
};

export default StatsCard;
