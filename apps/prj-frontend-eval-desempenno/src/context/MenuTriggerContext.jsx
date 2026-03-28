import { createContext, useContext, useState } from "react";

const MenuTriggerContext = createContext();

export function MenuTriggerProvider({ children }) {
  const [menuTrigger, setMenuTrigger] = useState(0);

  const fireMenuTrigger = () => {
    setMenuTrigger((t) => t + 1);
  };

  return (
    <MenuTriggerContext.Provider value={{ menuTrigger, fireMenuTrigger }}>
      {children}
    </MenuTriggerContext.Provider>
  );
}

export const useMenuTrigger = () => useContext(MenuTriggerContext);
