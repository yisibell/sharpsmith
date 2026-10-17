export interface SharpsmithOptions {
  concurrentFileLimit?: number;
}

export type ErrorFirstCallback<T> = (error: Error | null, value?: T) => void;
