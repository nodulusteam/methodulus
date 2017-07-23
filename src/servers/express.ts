import * as express from "express";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as logger from "morgan";
import * as path from "path";
import { MethodDescriptor, Verbs, MethodError, MethodResult } from '../index';


import { fp } from '../fp';

import errorHandler = require("errorhandler");
import compression = require("compression");
import methodOverride = require("method-override");
const debug = require('debug')('methodulus');

const request = require('request-promise-native');

import "reflect-metadata";

export function Express(port) {

    let app = express();
    //app.set("port", port);
    //this.app.use(compression());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());
    app.useClass = function (classType) {
        app.use(new ExpressRouter(classType).router);

    }
    app._send = async (params, methodulus, paramsMap) => {
        debug('in _send:', params, methodulus, paramsMap);
        let baseUrl = await methodulus.resolver();
        let myUri = baseUrl + methodulus.route;
        let body = null;
        paramsMap.forEach((item) => {
            item.value = params[item.index];
            if (item.name)
                myUri = myUri.replace(':' + item.name, item.value);
            else
                body = item.value;
        })
        let requestOptions: any = {
            // will be ignored
            method: methodulus.verb,
            uri: myUri,
        }
        if (body) {
            requestOptions.body = body;
            requestOptions.json = true;
        }

        debug(requestOptions);
        try {
            let result = await request(requestOptions);
            if (typeof result === 'string' && (result[0] === '{' || result[0] === '['))
                return new MethodResult(JSON.parse(result));

        } catch (error) {

            throw (new MethodError(error.error, error.statusCode));
        }


    }
    return app;
}



export class ExpressRouter {
    public router: any;
    constructor(obj: any) {
        let proto = fp.proto(obj);
        let methodulus = proto.methodulus;
        //let collection = Object.getOwnPropertyNames(proto);
        let autoRouter = express.Router();
        Object.keys(methodulus._descriptors).forEach(itemKey => {
            let item = methodulus._descriptors[itemKey];
            switch (item.verb) {
                case Verbs.Get:
                    autoRouter.get(item.route, proto[itemKey].bind(obj));
                    break;
                case Verbs.Post:
                    autoRouter.post(item.route, proto[itemKey].bind(obj));

                    break;
                case Verbs.Delete:
                    autoRouter.delete(item.route, proto[itemKey].bind(obj));

                    break;
                case Verbs.Head:
                    autoRouter.head(item.route, proto[itemKey].bind(obj));

                    break;
                case Verbs.Put:
                    autoRouter.put(item.route, proto[itemKey].bind(obj));

                    break;
            }
        });

        this.router = autoRouter;
    }


}