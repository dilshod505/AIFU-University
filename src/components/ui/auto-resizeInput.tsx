import React, { useRef, useEffect, useState } from "react";
import { Input } from "antd";

export const AutoResizeInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(100);

  useEffect(() => {
    if (spanRef.current) {
      const newWidth = spanRef.current.offsetWidth + 24; // 24 = padding
      setWidth(Math.max(newWidth, 100));
    }
  }, [value]);

  return (
    <div className="relative inline-block">
      <span
        ref={spanRef}
        className="absolute opacity-0 whitespace-pre pointer-events-none font-normal text-sm"
      >
        {value || placeholder || ""}
      </span>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width,
          transition: "width 0.2s ease",
          borderRadius: "8px",
          height: "36px",
        }}
      />
    </div>
  );
};
