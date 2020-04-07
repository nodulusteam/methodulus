
export type Dictionary<T = any> = { [key: string]: T };
export class Verbs {
    public static Get: string = 'GET';
    public static Post: string = 'POST';
    public static Put: string = 'PUT';
    public static Patch: string = 'PATCH';
    public static Head: string = 'HEAD';
    public static Delete: string = 'DELETE';
}

export interface RequestParams {
    from: string;
    name?: string;
    value?: any;
    index: number;
}

export type ParamMapItem = { from: string; name?: string; index: number };
export interface MethodusObject {
    verb: string;
    route: string;
    resolver: string | Function;
    _auth: {
        type: number;
        options?: Dictionary<string> | Function;
    };
}


