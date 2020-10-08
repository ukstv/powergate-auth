import { BehaviorSubject, Observable, Subject } from "rxjs";
import { useEffect, useState } from "react";

export function useSubject<A>(subject: BehaviorSubject<A>) {
  const [value, setValue] = useState(subject.value);

  useEffect(() => {
    const subscription = subject.subscribe((next) => {
      setValue(next);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);

  return value;
}
