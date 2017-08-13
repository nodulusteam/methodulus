// tests/config.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
import { Gateway } from './classes/Gateway';
import { FirstClass } from './classes/FirstClass';
import { SecondClass } from './classes/SecondClass';
import { ThirdClass } from './classes/ThirdClass';

import { ServerType, Server, MethodulusConfig, MethodType } from '../index';
import { ServerClassHelper, ServerHelper, ClientHelper, CallHelper } from './helpers'

const redis_addr = '//192.168.99.100:32768';


const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
var childProcessDebug = require('child-process-debug');
process.env.CONFIG_PATH = "./tests/config";

const staticResolve = 'http://127.0.0.1:8090';
// describe('methodulus config defaults to "express"', function () {
//     it('loading configuration for methodulus', function () {
//         let config = new MethodulusConfig(['express']);
//         expect(config.servers[0]).to.equal('express');
//     });
// });
async function wait(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            resolve();
        }, timeout);
    })

}


xdescribe('test gateway configuration', function () {
    it('starting express gateway', async (done) => {
        //run the servers
        let server, server2, server3, client;

        try {
            server = await ServerClassHelper('FirstClass', 8091, 'express', MethodType.Local);
            server2 = await ServerClassHelper('SecondClass', 8092, 'express', MethodType.Local);
            server3 = await ServerClassHelper('ThirdClass', 8093, 'express', MethodType.Local);



            let config = new MethodulusConfig();

            config.run(ServerType.Express, { port: 8080, client: redis_addr, server: redis_addr, amqp: '127.0.0.1' });


            config.use(Gateway, MethodType.Local);
            config.use(FirstClass, MethodType.Http, 'http://127.0.0.1:8091');
            config.use(SecondClass, MethodType.Http, 'http://127.0.0.1:8092');
            config.use(ThirdClass, MethodType.Http, 'http://127.0.0.1:8093');

            //MethodulusConfig.config[classType.name] = methodType;
            //MethodulusConfig.servers = servers;
            let client = await new Server(8080).configure(config).start();
            await wait(5 * 1000);
           
            let gw = new Gateway();
            try {
                let result1: any = await gw.callFirstClass();
                expect(result1.add).to.equal('added');
            } catch (err) {
                console.log('call error', err);
            }

            try {
                let result2: any = await gw.callSecondClass();
                expect(result2.add).to.equal('added');
            } catch (err) {
                console.log('call error', err);
            }

            try {
                let result3: any = await gw.callThirdClass();
                expect(result3.add).to.equal('added');
            } catch (err) {
                console.log('call error', err);
            }


        } catch (error) {
            console.log('got error', error);
        } finally {
             await wait(5 * 1000);
            if (server)
                server.kill();
            if (server2)
                server2.kill();
            if (server3)
                server3.kill();
            if (client)
                client.kill();



        }
       
        done();
        //run the client







    });



});