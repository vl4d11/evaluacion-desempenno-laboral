import { useState, useEffect } from "react";

export default function LazyPage({ loader, children }) {
  const [Comp, setComp] = useState(null);
  useEffect(() => {
    let active = true;
    loader().then((mod) => active && setComp(() => mod));
    return () => { active = false; };
  }, [loader]);

  if (!Comp) return <div>Cargando…</div>;

  return <Comp>{children}</Comp>;
}
