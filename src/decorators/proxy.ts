import { MethodType } from '../interfaces';
import { ConfigHelper } from './configuration';
import { fp } from '../fp';
const debug = require('debug')('methodus');
import * as path from 'path';

export class Proxy {
    public static ProxyClass(className: string, localClassPath) {
        return (target: any) => {
            const methodus = fp.maybeMethodus(target);
            let classTransport = MethodType.Local;
            let classConfig;
            if (!methodus) {
                throw (new Error(`error finding configuration ${className},${localClassPath}`));
            }

            if (methodus) {

                classConfig = ConfigHelper.get(methodus.name);
                if (classConfig) {
                    classTransport = classConfig.transport;
                }
            }

            if (!classTransport || classTransport === MethodType.Local) {
                let startPathForLoad = methodus.name;
                if (methodus.name.indexOf('@') < 0) {
                    startPathForLoad = path.join(process.cwd(), methodus.name);
                }
                const localLoadPath = path.join(startPathForLoad, localClassPath);
                debug(this, `trying to load ${localLoadPath} locally`);
                try {
                    try {
                        const localClass = require(localLoadPath);
                        debug(this, `succesfully loaded ${localLoadPath} locally`);
                        return localClass[className];
                    } catch (error) {
                        try {
                            debug(this, `will try other options ${localClassPath} locally`);
                            const localClass = require(path.join(process.cwd(), localClassPath));
                            debug(this, `succesfully loaded ${localClass} locally`);
                            return localClass[className];
                        } catch (error) {
                            debug(this, `will try last option ${localClassPath} locally`);
                            const localClass = require(path.join(process.cwd(),
                                'node_modules',
                                methodus.name, localClassPath));
                            debug(this, `succesfully loaded ${localClass} locally`);
                            return localClass[className];
                        }
                    }
                } catch (ex) {
                    console.error(ex);
                    throw (ex);
                }
            }
            debug(this, 'returned the contract it self for' + className);
            return target;
        };
    }
}