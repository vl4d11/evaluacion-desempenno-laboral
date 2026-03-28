import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import React from "react";

const Card = forwardRef(function Card(
  {
    title = "",
    className = "",
    layout = "grid",
    children,
    hidden = false,
    enabled = true
  }, ref) {
  const [titleState, setTitleState] = useState(title);
  const [hiddenState, setHiddenState] = useState(hidden);
  const [enabledState, setEnabledState] = useState(enabled);

    let bodyLayout = "";

    switch (layout) {
      case "grid":
        bodyLayout = "grid grid-cols-1 lg:grid-cols-24 gap-x-4 gap-y-3 items-end auto-rows-auto";
        break;
      case "flex":
        bodyLayout = "flex flex-col sm:flex-row flex-wrap gap-4 items-center";
        break;
      case "flex-between":
        bodyLayout = "flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4";
        break;
      case "flow":
        bodyLayout = "flex flex-col gap-4";
        break;
      default:
        bodyLayout = "";
    }

    useEffect(() => {
      setHiddenState(hidden);
    }, [hidden]);

    useEffect(() => {
      setEnabledState(enabled);
    }, [enabled]);

    useImperativeHandle(ref, () => ({
      setTitle: (v) => setTitleState(v ?? ""),
      getTitle: () => titleState,
      setHidden: (v) => setHiddenState(!!v),
      isHidden: () => hiddenState,
      setEnabled: (v) => setEnabledState(!!v),
      isEnabled: () => enabledState
    }));

    const visibleChildren = React.Children.toArray(children).filter(Boolean);
    if (titleState === "" && visibleChildren.length === 0) {
      return null;
    }

    return (
      <div
        className={`
          bg-white
          rounded-xl
          shadow-lg
          overflow-hidden
          ${hiddenState ? "hidden" : ""}
          ${!enabledState ? "opacity-60 pointer-events-none cursor-not-allowed **:cursor-not-allowed" : ""}
          ${className}
        `}
      >
        {titleState !== "" && (
          <div className="bg-linear-to-r from-blue-400 to-blue-600 text-white font-extrabold px-4 py-3 shadow-md text-lg">
            {titleState}
          </div>
        )}

        <div className={`p-4 ${bodyLayout} ${!enabledState ? "cursor-not-allowed" : ""}`}>
          {children}
        </div>
      </div>
    );
  }
)

export default Card;
