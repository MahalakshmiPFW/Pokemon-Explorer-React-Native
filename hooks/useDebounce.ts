import { useEffect, useState } from "react";

/**
 * Custom hook to debounce (slow down) a value (e.g. search query)
 * Delays updating the value until user stops typing for the specified delay
 * Prevents excessive filtering/search operations
 * @param value - The value to debounce (e.g. search query)
 * @param delay - The delay in milliseconds (default is 500ms)
 * @returns The debounced value which is updated after the delay
 * @example
 * const debouncedValue = useDebounce(value, 500);
 * return (
 *   <TextInput
 *     value={debouncedValue}
 *     onChangeText={setValue}
 *   />
 * );
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel timer if value changes before delay completes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

