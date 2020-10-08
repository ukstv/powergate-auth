import { useEffect, useState } from "react";
import { InitSubject } from "./init-subject";

export function useSubject<A>(subject: InitSubject<A>) {
  const [value, setValue] = useState(subject.value);

  useEffect(() => {
    const subscription = subject.subscribe((next) => setValue(next));
    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);

  return value;
}
