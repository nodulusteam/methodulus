import 'reflect-metadata';
import { fp } from '../../src/fp';
import { AMQP } from './amqp';
import { logger } from '../../src/log';
import { MethodEvent } from '../../src/response';
import * as domain from 'domain';

export async function registerHandlers(proto: any, options: any) {
    return new Promise((resolve, reject) => {
        let foundEvents = false;
        if (proto.methodus._events && Object.keys(proto.methodus._events).length > 0) {
            logger.log(this, 'registering events bus for:', Object.keys(proto.methodus._events));
            const dom = domain.create();
            foundEvents = true;
            dom.on('error', () => {
                registerHandlers(proto, options);
            });

            dom.run(() => {
                AMQP.connect(options).then((conn: any) => {
                    conn.createChannel().then((ch: any) => {
                        let exchangeArr = fp.unique(Object.keys(proto.methodus._events)
                            .map((event) => proto.methodus._events[event].exchange));
                        if (exchangeArr.length === 0) {
                            exchangeArr = ['event-bus'];
                        }
                        logger.log(this, exchangeArr);
                        exchangeArr.forEach((exchange: any) => {
                            //  let exchange = proto.methodus.exchange || 'event-bus';

                            ch.assertQueue('', { exclusive: true, durable: true }).then((q: any) => {
                                Object.keys(proto.methodus._events).forEach((event: any) => {
                                    ch.bindQueue(q.queue, exchange, proto.methodus._events[event].name);
                                });

                                ch.consume(q.queue, async (msg: any) => {
                                    if (msg && msg.content) {
                                        logger.log(this, ' [x] %s', msg.content.toString());
                                        logger.log(this, 'event message has arrived', msg.fields.routingKey);
                                        logger.log(this, 'msg string is', msg.content.toString());
                                        // parse message
                                        try {
                                            const parsedMessage = fp.maybeJson(msg.content.toString()) as MethodEvent;
                                            if (proto.methodus._events[parsedMessage.name]) {
                                                const pkey = proto.methodus._events[parsedMessage.name].propertyKey;
                                                if (proto[pkey]) {
                                                    await proto[pkey](parsedMessage.value,
                                                        parsedMessage.name); // no results for an event
                                                }
                                            } else {
                                                // perform a wild card search
                                                Object.keys(proto.methodus._events).forEach(async (eventName: any) => {
                                                    const eventNameWithoutStar = eventName.replace(/\*/g, '');
                                                    if (parsedMessage.name.indexOf(eventNameWithoutStar) === 0) {
                                                        const pkey = proto.methodus._events[eventName].propertyKey;
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
                        });
                    });
                });
            });
        }
        if (!foundEvents) {
            resolve();
        }
    });
}