// Global type declarations for diagnostic utilities
declare global {
  interface Window {
    __DIAG_CHECKPOINT?: (checkpoint: string) => void;
    __DIAG_FETCH_TIME?: (time: number) => void;
    // V14: Nerve Sniper types
    __NERVE_SNIPER_ACTIVE?: boolean;
    __NERVE_INTERCEPT_PUSH?: (href: string) => void;
    __NERVE_STACK_CAPTURE?: () => string;
  }
}

export { };
