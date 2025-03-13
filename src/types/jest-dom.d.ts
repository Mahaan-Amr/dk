import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalled(): R;
      toBe(expected: unknown): R;
      toBeGreaterThan(expected: number): R;
    }
  }
}

// This export is needed to make the file a module
export {}; 