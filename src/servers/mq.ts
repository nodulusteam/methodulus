
const debug = require('debug')('methodulus');
import "reflect-metadata";
import {fp} from '../fp';
import { amqpConnect } from './amqp';
export function MQ(port, httpServer) {
    var io: any = {};

    //return new Promise((resolve, reject) => {
    io.classRouters = [];




    io.useClass = function (classType) {
        new MQRouter(classType);

    }

    io._send = async (functionArgs, methodinformation, paramsMap) => {
        console.log(methodinformation);
        return new Promise((resolve, reject) => {
            amqpConnect().then((conn) => {

                conn.createChannel().then((ch) => {
                    var q = methodinformation.name;
                    let methodMessage = new MethodMessage();
                    methodMessage.to = methodinformation.propertyKey;
                    methodMessage.metadata = methodinformation;
                    methodMessage.message = paramsMap;
                    methodMessage.args = functionArgs;
                    let stringMessage = JSON.stringify(methodMessage);

                    ch.assertQueue('', { exclusive: true }).then((q) => {
                        var corr = generateUuid();
                        ch.consume(q.queue, (msg) => {

                            if (msg.properties.correlationId == corr) {
                                resolve(fp.maybeJson(msg.content.toString()));

                                // console.log(' [.] Got %s', msg.content.toString());
                                //setTimeout(function() { conn.close(); process.exit(0) }, 500);
                            }
                        }, { noAck: true });

                        ch.sendToQueue(methodinformation.name,
                            new Buffer(stringMessage),
                            { correlationId: corr, replyTo: q.queue });
                    });
                });


                // conn.createChannel().then((ch) => {
                //     var q = methodinformation.name;
                //     let methodMessage = new MethodMessage();
                //     methodMessage.to = methodinformation.propertyKey;
                //     methodMessage.metadata = methodinformation;
                //     methodMessage.message = paramsMap;
                //     methodMessage.args = functionArgs;
                //     let stringMessage = JSON.stringify(methodMessage);
                //     ch.assertQueue(q, { durable: false });
                //     // Note: on Node 6 Buffer.from(msg) should be used
                //     ch.sendToQueue(q, new Buffer(stringMessage));
                //     resolve(q);
                // });


            })




        });
    }



    return io;
}
function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

export class MethodMessage {
    to: string;
    message: any;
    metadata: any;
    args: any;
}

let metadataKey = 'methodulus';
export class MQServer {
    connection: any = null;
    constructor() {
        // amqpConnect().then((connection) => {
        //     this.connection = connection


        // });
    }


}
export class MQRouter {
    public router: any;
    constructor(obj: any) {
        let proto = fp.proto(obj);
        let methodulus = proto.methodulus;

        amqpConnect().then((conn) => {
            conn.createChannel().then((ch) => {
                let q = methodulus.name;
                ch.assertQueue(q, { durable: false }).then((q) => {
                    // ch.assertQueue(q, { durable: false });
                    ch.prefetch(1);
                    console.log(' [x] Awaiting RPC requests on', q.queue);
                    ch.consume(q.queue, async (msg) => {
                        console.log('got message', msg);

                        if (msg.content) {
                            console.log('got message', msg.content.toString());
                            //parse message
                            try {
                                let parsedMessage = fp.maybeJson(msg.content.toString()) as MethodMessage;
                                let result = await proto[parsedMessage.to](...parsedMessage.args);
                                console.log('the local result is', result);
                                if (msg.properties) {
                                    ch.sendToQueue(msg.properties.replyTo,
                                        new Buffer(JSON.stringify(result)),
                                        { correlationId: msg.properties.correlationId });

                                    ch.ack(msg);
                                }




                            } catch (error) {
                                console.log(error);
                            }
                        }

                    });


                }).catch((error) => {
                    console.log(error);
                });

            });
        });



    }
}