import { Context, createDefine } from "fresh";
import { SessionFrontend } from "../db/schemas/sessions.table.ts";
import { UserFrontend } from "../db/schemas/users.table.ts";

export interface CoreSvcContext {
  /**
   * Note: using SessionFrontend here because the session secret hash is not needed after successful authentication
   */
  session: SessionFrontend;
  /**
   * Note: using UserFrontend here because the password hash and salt are not needed after successful authentication
   */
  user: UserFrontend;

  /**
   * Can be used to set the title of the tab in the browser.
   * Will be rendered in the _app.tsx file.
   */
  tabTitle?: string;
}

export const define = createDefine<CoreSvcContext>();

export type CoreSvcFreshContext = Context<CoreSvcContext>;
