"use client";

const ProgressBar = ({ pct }: { pct: number }) => {
  return (
    <div className="h-1.5 rounded-full bg-gray-800">
      <div
        className="h-1.5 rounded-full bg-indigo-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default ProgressBar;
