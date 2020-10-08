import { BehaviorSubject } from "rxjs";

export class InitSubject<A> extends BehaviorSubject<A> {
  constructor(readonly init: A) {
    super(init);
  }
}
