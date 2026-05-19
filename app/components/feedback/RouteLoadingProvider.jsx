"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const RouteLoadingContext = createContext({
  hideLoader: () => {},
  showLoader: () => {},
});

function isModifiedEvent(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function resolveNavigationMessage(url) {
  if (url.pathname.startsWith("/orders")) {
    return "Opening your orders...";
  }

  if (url.pathname.startsWith("/checkout")) {
    return "Preparing checkout...";
  }

  if (url.pathname.startsWith("/shop")) {
    return "Loading the catalog...";
  }

  if (url.pathname.startsWith("/categories")) {
    return "Loading categories...";
  }

  if (url.pathname.startsWith("/new-arrivals")) {
    return "Loading new arrivals...";
  }

  return "GoModexa loading...";
}

export function useRouteLoading() {
  return useContext(RouteLoadingContext);
}

export default function RouteLoadingProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const timeoutRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState("GoModexa loading...");

  const clearHideTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showLoader = useCallback((nextMessage = "GoModexa loading...") => {
    clearHideTimer();
    setMessage(nextMessage);
    setIsVisible(true);
  }, [clearHideTimer]);

  const hideLoader = useCallback(() => {
    clearHideTimer();
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 180);
  }, [clearHideTimer]);

  useEffect(() => {
    clearHideTimer();
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 180);
  }, [clearHideTimer, pathname, searchKey]);

  useEffect(() => {
    function handleDocumentClick(event) {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      if (!href || href.startsWith("#") || target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const url = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (url.origin !== currentUrl.origin) {
        return;
      }

      if (
        url.pathname === currentUrl.pathname &&
        url.search === currentUrl.search &&
        url.hash === currentUrl.hash
      ) {
        return;
      }

      showLoader(resolveNavigationMessage(url));
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      clearHideTimer();
    };
  }, [clearHideTimer, showLoader]);

  const value = { hideLoader, showLoader };

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
      <div
        aria-hidden={!isVisible}
        className={`pointer-events-none fixed inset-0 z-[120] transition duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-[rgba(20,29,96,0.18)] backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-white/40">
          <div className="tt-loader-bar h-full w-1/3 rounded-full bg-[var(--brand-gold)]" />
        </div>
        <div className="absolute inset-x-0 top-5 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-white/50 bg-white/92 px-4 py-3 shadow-[0_18px_40px_-30px_rgba(20,29,96,0.45)]">
            <span className="tt-loader-spinner h-4 w-4 rounded-full border-2 border-[var(--brand-navy)]/20 border-t-[var(--brand-navy)]" />
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-navy)]">
              {message}
            </span>
          </div>
        </div>
      </div>
    </RouteLoadingContext.Provider>
  );
}

