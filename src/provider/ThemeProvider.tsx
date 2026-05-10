import { useEffect } from "react";

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    localStorage.removeItem("scoreflow-theme");
  }, []);

  return <>{children}</>;
}

export default ThemeProvider;
