"use client";

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile: any;
  }
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  className?: string;
}

export default function Turnstile({
  siteKey,
  onVerify,
  onError,
  onExpired,
  className = ""
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useEffect(() => {
    // Clean up previous widget
    if (widgetId && window.turnstile) {
      window.turnstile.remove(widgetId);
      setWidgetId(null);
    }

    if (!window.turnstile || !containerRef.current) return;

    const id = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => {
        onVerify(token);
      },
      'error-callback': () => {
        onError?.();
      },
      'expired-callback': () => {
        onExpired?.();
      },
    });

    setWidgetId(id);

    // Cleanup function
    return () => {
      if (id && window.turnstile) {
        window.turnstile.remove(id);
      }
      setWidgetId(null);
    };
  }, [siteKey]); // Only depend on siteKey to avoid unnecessary re-renders

  const reset = () => {
    if (widgetId) {
      window.turnstile.reset(widgetId);
    }
  };

  return (
    <div className={`cf-turnstile ${className}`} ref={containerRef} />
  );
}
