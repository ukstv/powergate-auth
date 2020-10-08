import { BehaviorSubject } from "rxjs";

/**
 * Complete after next or error.
 */
export class OneOffSubject<A> extends BehaviorSubject<A> {
  next(value: A) {
    super.next(value);
    this.complete();
  }

  error(err: any) {
    super.error(err);
    this.complete();
  }
}
