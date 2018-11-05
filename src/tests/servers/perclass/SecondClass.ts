import { SecondClass } from '../../classes/SecondClass';
import { ServerType, Server, MethodType, MethodusConfig } from '../../../index';

const config = new MethodusConfig();
const redis_addr = '//192.168.99.100:32768';

if (process.env.servers) {
    process.env.servers.split(',').forEach((server: ServerType) => {
        config.run(server, { port: process.env.PORT, client: redis_addr, server: redis_addr, amqp: '127.0.0.1' });
        config.use(SecondClass, process.env.METHODTYPE as MethodType, server, 'http://127.0.0.1:8092');
    });
}

new Server(process.env.PORT).configure(config).start();