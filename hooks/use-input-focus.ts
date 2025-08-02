'use client';

import { useCallback, useRef } from 'react';

export interface InputFocusControls {
  focus: () => void;
}

export function useInputFocus() {
  const inputRef = useRef<InputFocusControls | null>(null);

  const registerInputRef = useCallback(
    (controls: InputFocusControls | null) => {
      inputRef.current = controls;
    },
    [],
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return { registerInputRef, focusInput };
}
