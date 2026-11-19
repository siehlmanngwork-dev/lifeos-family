import { useEffect, useState } from 'react';

export interface SubscriptionState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

type Subscribe<T> = (onData: (data: T) => void, onError: (error: Error) => void) => () => void;

/**
 * Generic helper for live Firestore subscriptions.
 * Pass `null` as `subscribe` to stay idle (e.g. when a required id is missing).
 */
export function useSubscription<T>(
  subscribe: Subscribe<T> | null,
  initial: T,
  deps: readonly unknown[],
): SubscriptionState<T> {
  const [state, setState] = useState<SubscriptionState<T>>({
    data: initial,
    loading: subscribe !== null,
    error: null,
  });

  useEffect(() => {
    if (!subscribe) {
      setState({ data: initial, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    return subscribe(
      (data) => setState({ data, loading: false, error: null }),
      (error) => setState((s) => ({ ...s, loading: false, error: error.message })),
    );
    // `subscribe` is recreated on every render; `deps` controls resubscription.
  }, deps);

  return state;
}
