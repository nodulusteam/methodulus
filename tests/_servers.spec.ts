// tests/config.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
import { TestClass } from './classes/test-class';
import { Server, MethodulusConfig, MethodType } from '../index';
import { ServerHelper, ClientHelper, CallHelper } from './helpers'




const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
var childProcessDebug = require('child-process-debug');
process.env.CONFIG_PATH = "./tests/config";
process.env.silent = true;
const staticResolve = 'http://localhost:8090';
// describe('methodulus config defaults to "express"', function () {
//     it('loading configuration for methodulus', function () {
//         let config = new MethodulusConfig(['express']);
//         expect(config.servers[0]).to.equal('express');
//     });
// });

describe('initiate modes', function () {
    it('starting express server', async (done) => {
        //run the servers
        let server, client;

        try {
            server = ServerHelper(8090, 'express', MethodType.Local);
            client = ClientHelper(TestClass, 8080, ['express'], MethodType.Http, staticResolve);
            this.timeout(2000);
            let result = await CallHelper();


            expect(result.add).to.equal('added');
        } catch (error) {
            console.log('got error', error);
        } finally {
            if (server)
                server.kill();
            if (client)
                client.kill();



        }
        this.timeout(2000);
        done();
        //run the client







    });

    it('starting socketio server', async (done) => {
        let server, client;


        try {
            server = ServerHelper(8090, 'socketio', MethodType.Local);

            //run the client
            client = ClientHelper(TestClass, 8080, ['socketio'], MethodType.Socket, staticResolve);

            let result = await CallHelper();
            if (result)
                expect(result.add).to.equal('added');
        } catch (error) {
            console.log(error);
        } finally {
            if (server)
                server.kill();
            if (client)
                client.kill();
            this.timeout(2000);
            done();

        }





    });

    it('starting redis server', async (done) => {
        let server, client;
        try {
            server = ServerHelper(8090, 'redis', MethodType.Local);
            //run the client
            client = ClientHelper(TestClass, 8080, ['redis'], MethodType.Redis, staticResolve);

            let result = await CallHelper();
            if (result)
                expect(result.add).to.equal('added');
        } catch (error) {
            console.log(error);
        } finally {
            if (server)
                server.kill();
            if (client)
                client.kill();

            this.timeout(2000);
            done();

        }




    });

    it('starting [express,socketio] server', async (done) => {
        let server, client;
        try {
            server = ServerHelper(8090, 'express,socketio', MethodType.Local);
            //run the client
            client = ClientHelper(TestClass, 8080, ['express', 'socketio'], MethodType.Socket, staticResolve);

            let result = await CallHelper();
            expect(result.add).to.equal('added');
        } catch (error) {

        } finally {
            if (Server)
                server.kill();
            if (client)
                client.kill();
        }




        this.timeout(2000);
        done();
    });



});
