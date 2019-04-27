
import { Request } from './Request';
import { MethodError } from '../..';
export function send(methodus: any, functionArgs: any, paramsMap: any, securityContext: any) {
    const request = new Request();
    const baseUrl = methodus.resolver();
    if (baseUrl) {
        return request.sendRequest(methodus.verb, baseUrl + methodus.route, functionArgs,
            paramsMap, securityContext);
    } else {
        return new MethodError('no server found for this method' + methodus.route, 302);
    }
}