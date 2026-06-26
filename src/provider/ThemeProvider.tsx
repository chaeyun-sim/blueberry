import { ReactNode, useEffect } from "react";

function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    localStorage.removeItem("scoreflow-theme");
    localStorage.removeItem("blueberry-theme");
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;
