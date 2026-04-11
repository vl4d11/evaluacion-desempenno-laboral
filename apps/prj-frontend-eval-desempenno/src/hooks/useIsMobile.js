import { useState, useEffect, useRef } from "react";

const useIsMobile = (breakpoint = 768, onModeChange) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  const lastMode = useRef(isMobile);

  useEffect(() => {
    const handleResize = () => {
      const next = window.innerWidth < breakpoint
      if (next !== lastMode.current) {
        lastMode.current = next
        setIsMobile(next);
        onModeChange?.();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint, onModeChange]);

  return isMobile;
};

export default useIsMobile;
