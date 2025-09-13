import { Context, createDefine } from "fresh";
import { SessionFrontend } from "../db/schemas/sessions.table.ts";
import { UserFrontend } from "../db/schemas/users.table.ts";

export interface CoreSvcContext {
  /**
   * Note: using UserFrontend here because the password hash and salt are not needed after successful authentication
   * TODO: delete and replace with authPromise
   */
  user: UserFrontend;

  authPromise: Promise<
    { type: "response"; response: Response } | {
      type: "data";
      session: SessionFrontend;
      user: UserFrontend;
    }
  >;

  /**
   * Can be used to set the title of the tab in the browser.
   * Will be rendered in the _app.tsx file.
   */
  tabTitle?: string;
}

export const define = createDefine<CoreSvcContext>();

export type CoreSvcFreshContext = Context<CoreSvcContext>;
