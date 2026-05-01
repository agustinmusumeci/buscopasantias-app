import { useEffect, useState } from "react";

export function useDesktopResolution({ resolution = 1024 }) {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= resolution);

   useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= resolution);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resolution]);


  return isDesktop;
}
