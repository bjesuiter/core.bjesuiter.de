import { Session } from "../utils/auth.ts";
import { User } from "../utils/user.type.ts";

// Todo: rename to CoresvcCtxState
export interface CoreSvcContext {
  session: Session;
  user: User;

  /**
   * Can be used to set the title of the tab in the browser.
   * Will be rendered in the _app.tsx file.
   */
  tabTitle?: string;
}
