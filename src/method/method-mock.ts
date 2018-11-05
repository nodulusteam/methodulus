import 'reflect-metadata';
import { fp } from '../fp';

/** the @MethodMock decorator registers the model with the odm
 *  @param {Verbs} verb - the HTTP verb for the route.
 *  @param {string} route - express route string.
 *  @param {Function[]} middlewares - an array of middlewares to apply to this function}
 */

export function MethodMock(mockedResult: any) {
    return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
        var methodus = fp.maybeMethodus(target);
        methodus._mocks = methodus._mocks || {}
        methodus._mocks[propertyKey] = mockedResult;  
        return descriptor;
    }
}
