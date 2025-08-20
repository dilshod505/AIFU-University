"use client";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const TopButton = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / windowHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 flex justify-center items-center w-[60px] h-[60px] rounded-full bg-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 ease-in-out group"
    >
      {/* Progress halqa */}
      <svg className="absolute w-[72px] h-[72px] -rotate-90">
        {/* Orqa fon halqa */}
        <circle
          cx="36"
          cy="36"
          r="30"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress halqa (cyan → blue) */}
        <circle
          cx="36"
          cy="36"
          r="30"
          stroke="url(#progressGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 30}
          strokeDashoffset={2 * Math.PI * 30 * (1 - scrollProgress / 100)}
          className="transition-all duration-200"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
            <stop offset="100%" stopColor="#2563eb" /> {/* blue-600 */}
          </linearGradient>
        </defs>
      </svg>

      {/* Icon (pink) */}
      <FaArrowUp className="z-10 text-xl text-pink-500 group-hover:scale-125 transition-transform duration-300" />
    </button>
  );
};

export default TopButton;
