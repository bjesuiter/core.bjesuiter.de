import { Context, createDefine } from "fresh";
import { CoreSvcContext } from "../../types/fresh_ctx_state.type.ts";

export const define = createDefine<CoreSvcContext>();

export type CoreSvcFreshContext = Context<CoreSvcContext>;
