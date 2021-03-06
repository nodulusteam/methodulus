import 'reflect-metadata';
const ANNOTATIONS = '__annotations__';

export class Injector {
    private static records: { name: string, target: any, deps: any }[] = [];
    private static singletons: any = {};

    static inject(target: any, name?: string) {
        //use the injectable logic here
        const annotations = target.hasOwnProperty(ANNOTATIONS) ?
            target[ANNOTATIONS] :
            Object.defineProperty(target, ANNOTATIONS, { value: [] })[ANNOTATIONS];


            
        const constructorArgs = Reflect.getOwnMetadata('design:paramtypes', target);

        if (target.name!.length > 2) {
            name = target.name;
        }
        Injector.register(name, target, constructorArgs);
        annotations.push('injectable');
    }

    static resolveAndCreate(tokens: Array<any>) {
        tokens.forEach((target: any) => {
            // const annotations = token.hasOwnProperty(ANNOTATIONS);

            let name = target.name;
            Injector.records.push({
                name,
                target,
                deps: Reflect.getOwnMetadata('design:paramtypes', target) || []
            })
        })
        return this
    }
    static register(name: string, target: any, deps: any = []) {

        Injector.records.push({
            name,
            target,
            deps: deps
        });
    }
    static get<T = any>(_token: any): T {
        if (!_token) {
            return null as any;
        }
        //some times the token is a string so
        let symbol = _token;
        if (typeof _token !== 'string') {
            symbol = _token.name;
        }

        // get the `token` from the record set
        const all = Injector.records.filter((recordItem) => {
            return recordItem.name === symbol
        });

        if (!all || all.length === 0) {
            return null as any;
            // throw new Error(`Injection token not found ${symbol},
            // did you forgot to decorate it with the @Injectible decorator? `)

        }
        const record = all[0];
        // resolve dependencies into instances

        record.deps = record.deps.map((dep: any) => {
            if (dep) {
                return Injector.get(dep);
            } else {
                return null;
            }
        });

        const annotations = Reflect.getOwnMetadata(ANNOTATIONS, record.target);
        if (annotations && annotations.indexOf('singleton') === -1) {
            return new record.target(...record.deps);
        }
        else {
            if (!this.singletons[symbol]) {
                this.singletons[symbol] = new record.target(...record.deps);
            }
            return this.singletons[symbol];
        }
    }
}