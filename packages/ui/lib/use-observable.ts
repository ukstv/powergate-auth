import { Observable } from "rxjs";
import { useEffect, useState } from "react";

export function useObservable<A>(observable: Observable<A>, initial: A) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const subscription = observable.subscribe((next) => {
      setValue(next);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [observable]);

  return value;
}
