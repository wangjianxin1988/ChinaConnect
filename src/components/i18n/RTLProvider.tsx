/**
 * RTLProvider - Right-to-Left Language Support for React Components
 *
 * Automatically applies RTL styling and layout adjustments for Arabic and other RTL languages.
 * Works with the i18n system to detect language changes and update document direction.
 */

import { getCurrentLanguage } from "@/i18n/i18n";
import type { Language } from "@/i18n/translations";
import { isRTL } from "@/i18n/translations";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface RTLContextValue {
  isRTL: boolean;
  direction: "ltr" | "rtl";
  language: Language;
}

const RTLContext = createContext<RTLContextValue>({
  isRTL: false,
  direction: "ltr",
  language: "en",
});

export interface RTLProviderProps {
  children: ReactNode;
  /** Initial language override */
  initialLanguage?: Language;
  /** Callback when direction changes */
  onDirectionChange?: (isRTL: boolean) => void;
}

/**
 * RTLProvider component
 *
 * Wrap your app with this provider to enable automatic RTL support.
 * It will:
 * - Detect the current language from storage/browser
 * - Apply the correct text direction (rtl/ltr) to the document
 * - Provide RTL context to child components
 * - Listen for language changes and update accordingly
 *
 * @example
 * ```tsx
 * // In your app entry point
 * import { RTLProvider } from '@/components/i18n/RTLProvider';
 *
 * function App() {
 *   return (
 *     <RTLProvider>
 *       <YourAppContent />
 *     </RTLProvider>
 *   );
 * }
 * ```
 */
export function RTLProvider({ children, initialLanguage, onDirectionChange }: RTLProviderProps) {
  const [state, setState] = useState<RTLContextValue>(() => {
    const lang = initialLanguage || getCurrentLanguage();
    return {
      isRTL: isRTL(lang),
      direction: isRTL(lang) ? "rtl" : "ltr",
      language: lang,
    };
  });

  // Update document direction when state changes
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.dir = state.direction;
    document.documentElement.lang = state.language;

    // Notify callback
    onDirectionChange?.(state.isRTL);

    // Dispatch event for non-React components
    window.dispatchEvent(
      new CustomEvent("directionchange", {
        detail: { isRTL: state.isRTL, direction: state.direction },
      }),
    );
  }, [state, onDirectionChange]);

  // Listen for language changes from other parts of the app
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLanguageChange = (event: CustomEvent<Language>) => {
      const newLang = event.detail;
      const newIsRTL = isRTL(newLang);

      setState({
        isRTL: newIsRTL,
        direction: newIsRTL ? "rtl" : "ltr",
        language: newLang,
      });
    };

    window.addEventListener("languagechange", handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener("languagechange", handleLanguageChange as EventListener);
    };
  }, []);

  return <RTLContext.Provider value={state}>{children}</RTLContext.Provider>;
}

/**
 * Hook to access RTL context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isRTL, direction, language } = useRTL();
 *
 *   return (
 *     <div style={{ direction }}>
 *       {isRTL ? 'Right to left layout' : 'Left to right layout'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRTL(): RTLContextValue {
  return useContext(RTLContext);
}

/**
 * Hook to check if current direction is RTL
 * Convenience hook for simple boolean check
 *
 * @example
 * ```tsx
 * function AlignWrapper({ children }) {
 *   const isRTL = useIsRTL();
 *   return <div style={{ textAlign: isRTL ? 'right' : 'left' }}>{children}</div>;
 * }
 * ```
 */
export function useIsRTL(): boolean {
  const { isRTL } = useContext(RTLContext);
  return isRTL;
}

/**
 * Component that conditionally renders based on RTL state
 *
 * @example
 * ```tsx
 * <RTL-aware direction-aware components>
 *   <RTLIf isRTL={<RTLLayout />} else={<LTRLayout />} />
 * </RTL-aware>
 * ```
 */
export interface RTLIfProps {
  isRTL: React.ReactNode;
  else?: React.ReactNode;
}

export function RTLIf({ isRTL: rtlContent, else: ltrContent }: RTLIfProps): React.ReactElement {
  const { isRTL } = useContext(RTLContext);
  return <>{isRTL ? rtlContent : ltrContent}</>;
}

/**
 * Apply RTL-aware CSS classes
 *
 * @example
 * ```tsx
 * // Returns 'ml-2' for LTR, 'mr-2' for RTL
 * const marginClass = rtlClass('ml-2', 'mr-2');
 *
 * // Returns 'text-left' for LTR, 'text-right' for RTL
 * const alignClass = rtlClass('text-left', 'text-right');
 * ```
 */
export function rtlClass(ltrClass: string, rtlClass: string): string {
  const { isRTL } = useContext(RTLContext);
  return isRTL ? rtlClass : ltrClass;
}

/**
 * Get RTL-adjusted value
 *
 * @example
 * ```tsx
 * // Returns 'left' for LTR, 'right' for RTL
 * const startPos = rtlValue('left', 'right');
 *
 * // Returns 0 for LTR, 1 for RTL (for order property)
 * const order = rtlValue(0, 1);
 * ```
 */
export function rtlValue<T>(ltrValue: T, rtlValue: T): T {
  const { isRTL } = useContext(RTLContext);
  return isRTL ? rtlValue : ltrValue;
}

/**
 * HOC to make a component RTL-aware
 *
 * @example
 * ```tsx
 * const RTLAwareComponent = withRTL(MyComponent);
 * ```
 */
export function withRTL<P extends object>(Component: React.ComponentType<P & RTLContextValue>) {
  return function RTLAwareComponent(props: P) {
    const rtlContext = useRTL();
    return <Component {...props} {...rtlContext} />;
  };
}
