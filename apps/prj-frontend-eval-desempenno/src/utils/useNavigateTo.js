import { useNavigate }  from "react-router-dom";

export const useNavigateTo = () => {
  const navigate = useNavigate();
  const navigateTo = (to, options) => navigate(to, options);

  return {
    go: navigateTo,
    raw: navigate,
  }
};
