import { Context, createDefine } from "fresh";
import { SessionFrontend } from "../db/schemas/sessions.table.ts";
import { UserFrontend } from "../db/schemas/users.table.ts";

export interface CoreSvcContext {
  authPromise: Promise<
    { type: "response"; response: Response } | {
      type: "data";
      session: SessionFrontend;
      user: UserFrontend;
      isRootUser?: boolean;
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
