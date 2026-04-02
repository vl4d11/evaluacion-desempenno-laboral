import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

export const useNavigateTo = () => {
  const navigate = useNavigate();

  return useMemo(() =>({
    go: (to, options = {}) => navigate(to, options),
    replace: (to) => navigate(to, { replace: true }),
    back: () => navigate(-1),
    raw: navigate,
  }),[navigate]);
};
