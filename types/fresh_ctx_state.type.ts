import { Session } from "../utils/auth.ts";
import { User } from "../utils/user.type.ts";

export interface FreshCtxState {
  session: Session;
  user: User;
}
