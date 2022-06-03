import { Dispatch } from "@ngxs-labs/dispatch-decorator";
import { Navigate } from "@ngxs/router-plugin";

export class RouterDispatcher {
    @Dispatch()
    public static navigate(url) {
        return [new Navigate([url]) ];
    }
}