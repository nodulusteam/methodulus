

const debug = require('debug')('tmla:methodus:mq');
import 'reflect-metadata';
import { fp } from '../../fp';
import { AMQP } from './amqp';
import { BaseServer } from '../base';
import { LogLevel, logger, Log, LogClass } from '../../logger';
import { MethodType, MethodusClassConfig, ConnectionOptions, MethodusConfigurations } from '../../config';
import { MethodResult, MethodError, MethodEvent, MethodMessage, generateUuid } from '../../response';
import * as domain from 'domain';
import * as _ from 'lodash';


export async function registerHandlers(proto,options) {

    return new Promise((resolve, reject) => {
        let foundEvents = false;
        if (proto.methodus._events && Object.keys(proto.methodus._events).length > 0) {
            logger.trace(this, 'registering events bus for:', Object.keys(proto.methodus._events));
            var dom = domain.create();
            foundEvents = true;
            dom.on('error', () => {
                registerHandlers(proto,options)
            });

            dom.run(() => {
                AMQP.connect(options).then((conn) => {
                    conn.createChannel().then((ch) => {
                        let exchangeArr = _.uniq(Object.keys(proto.methodus._events).map(event => proto.methodus._events[event].exchange));
                        if (exchangeArr.length === 0) {
                            exchangeArr = ['event-bus'];
                        }
                        logger.trace(this, exchangeArr);
                        exchangeArr.map(exchange => {
                            //  let exchange = proto.methodus.exchange || 'event-bus';

                            ch.assertQueue('', { exclusive: true, durable: true }).then((q) => {
                                Object.keys(proto.methodus._events).map(event => {
                                    ch.bindQueue(q.queue, exchange, proto.methodus._events[event].name);
                                })

                                ch.consume(q.queue, async (msg) => {
                                    if (msg && msg.content) {
                                        logger.trace(this, ' [x] %s', msg.content.toString());
                                        logger.trace(this, 'event message has arrived', msg.fields.routingKey);
                                        logger.trace(this, 'msg string is', msg.content.toString());
                                        //parse message
                                        try {
                                            let parsedMessage = fp.maybeJson(msg.content.toString()) as MethodEvent;
                                            if (proto.methodus._events[parsedMessage.name]) {
                                                let pkey = proto.methodus._events[parsedMessage.name].propertyKey;
                                                if (proto[pkey]) {
                                                    await proto[pkey](parsedMessage.value, parsedMessage.name); //no results for an event
                                                }
                                            } else {
                                                //perform a wild card search
                                                Object.keys(proto.methodus._events).map(async eventName => {
                                                    let eventNameWithoutStar = eventName.replace(/\*/g, '')
                                                    if (parsedMessage.name.indexOf(eventNameWithoutStar) === 0) {
                                                        let pkey = proto.methodus._events[eventName].propertyKey;
                                                        if (proto[pkey]) {
                                                            await proto[pkey](parsedMessage.value, parsedMessage.name);
                                                        }
                                                    }
                                                });
                                            }

                                        } catch (error) {
                                            logger.error(this, error);
                                        }
                                    } else {
                                        logger.error(this, `recieved empty message`);
                                    }
                                }, { noAck: true });

                                resolve();
                            });


                        })


                    });

                });

            })

        }


        if (!foundEvents) {
            resolve();
        }
    })
}