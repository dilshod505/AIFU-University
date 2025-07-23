import React from "react";

export interface CustomCheckboxProps {
  checked: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
}) => {
  const handleChange = () => {
    if (!disabled) {
      onCheckedChange(checked === true ? false : true);
    }
  };

  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div
        onClick={handleChange}
        className={`w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center transition
          ${checked === true ? "bg-primary border-primary" : "bg-background"} 
          ${disabled ? "bg-muted" : "hover:border-muted-foreground"}
        `}
      >
        {checked === true && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
        {checked === "indeterminate" && (
          <div className="w-2.5 h-0.5 bg-white rounded-sm" />
        )}
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
};
