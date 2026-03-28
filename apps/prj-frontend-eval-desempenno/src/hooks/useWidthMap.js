import { useMemo } from "react";

export const useWidthMap = () => {
  return useMemo(() => {
    const map = {};

    for (let i = 10; i <= 100; i += 10) {
      map[i] = i === 100 ? "w-full flex-none" : `w-[${i}%] flex-none`;
    }

    return map;
  }, []);
};
