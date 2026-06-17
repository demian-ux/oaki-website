"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type RefObject,
  type ReactNode,
} from "react";

interface HeroThemeValue {
  /** True while the viewport is over a full-bleed dark hero render, so the
   *  header should invert (transparent + slim scrim + white chrome). */
  overHeroDark: boolean;
  setHeroDark: (dark: boolean) => void;
}

const HeroThemeContext = createContext<HeroThemeValue>({
  overHeroDark: false,
  setHeroDark: () => {},
});

export function HeroThemeProvider({ children }: { children: ReactNode }) {
  const [overHeroDark, setOverHeroDark] = useState(false);
  const setHeroDark = useCallback((dark: boolean) => setOverHeroDark(dark), []);
  return (
    <HeroThemeContext.Provider value={{ overHeroDark, setHeroDark }}>
      {children}
    </HeroThemeContext.Provider>
  );
}

export function useHeroTheme() {
  return useContext(HeroThemeContext);
}

/**
 * Inverts the header (transparent + slim scrim + white chrome) for as long
 * as the referenced full-bleed render still sits under the navbar, then
 * hands back to the normal bar the moment you scroll past it onto the solid
 * band below. This is the v3.0 Studio / Case rule: the render carries only
 * the navbar; the headline lives on a solid surface below.
 */
export function useHeroDarkWhileCovering<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
) {
  const { setHeroDark } = useHeroTheme();
  useEffect(() => {
    if (!active) {
      setHeroDark(false);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // Invert while the render's bottom edge is still below the navbar
      // band (~90px). Once it scrolls above that, hand back to the bar.
      setHeroDark(el.getBoundingClientRect().bottom > 90);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      setHeroDark(false);
    };
  }, [ref, active, setHeroDark]);
}
