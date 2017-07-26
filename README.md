# Methodulus

<a href="https://travis-ci.org/nodulusteam/methodulus">
<img src="./examples/resources/methodulus.png" alt="Drawing" style="max-width: 200px!important;"/>
</a>

[<img src="https://travis-ci.org/nodulusteam/methodulus.svg?branch=master">](https://travis-ci.org/nodulusteam/methodulus)
 

### motivation
* we want microservices!
* we need a dynamic system architecture!
* we want it all!


### automatic server to server connectivity using a dynamic rpc transport layer



`npm i -S methodulus`


<img src="./examples/resources/slide1.png">


#### Hello methodulus

> This example creats a rest (express based) server using a controller class `Player`
>
> it is configured to run the class code locally via an http server.
 

```
import { Player } from './controllers/player';
import { ServerType, Server, MethodulusConfig, MethodulusClassConfig, MethodType } from 'methodulus';

let config = new MethodulusConfig();
config.run(ServerType.express, {port: process.env.PORT });
config.use(Player, MethodType.Local, 'http://localhost:8090')
const server = new Server(process.env.PORT || 8020).configure(config).start();


```

#### the Player class
```
import { Body, Method, MethodConfig, MethodType, Param, Query, Verbs, MethodError, MethodResult } from 'methodulus';
import { PlayerModel } from '../models/player';


@MethodConfig('Player')
export class Player {
    @Method(Verbs.Post, '/api/player')
    public async create() {
        let p = new PlayerModel('1', 'player 1');
        await DB.Player.insert(p);
        return new MethodResult(p)
    }

    @Method(Verbs.Get, '/api/player/:player_id')
    public async read( @Param('player_id') playerId: number) {
        return await DB.Player.find({ 'Id': playerId });
    }

    @Method(Verbs.Put, '/api/player')
    public async update() {

    }


    @Method(Verbs.Delete, '/api/player')
    public delete() {

    }



}

```
 




# Classes & API

## MethodulusConfig
> configuration must complete before the server starts.
> configure each controller class to its desired state

### Available servers
an instamce of methodulus can run multiple listeners in different channels. the current list is:
* `express`
* `socketio`
* `amqp`
* `redis`
### Resolver
in order to access the correct service methodulus uses a resolver, which may be a literal containing the service uri or a promise returning the same.

resolvers are attached to a class, allowing the application to use different resolvers for different services.

here is a simple local configuration:
```
let servers = ['express']; 
let config = new MethodulusConfig(servers);
let resolver = 'http://localhost:8090';
config.use(TestClass, MethodType.Local,resolver);

```
> The class `Player` to run locally.
## MethodType
> avaliable options are  `Local | Http | MQ | Socket`
* `Local`
run the code in the class, no proxy or transport required.

* `Http`
run the code using an http request to a microservice.


* `MQ`
use amqp rpc to execute the class code

* `Socket`
directly connect to a server using websocket connection.

* `Redis`
use redis rpc to execute the class code

## Server
> creates an agnostic configured server.
```
const server = new Server(process.env.PORT);
```

Server methods are chainable and should e called in this order
```
const server = new Server(process.env.PORT).configure(config).start();
```
# Decorators
## Class decorators
### @MethodConfig
### @Method
## Parameter decorators
### @Query
### @Param
### @Body
### @Request
### @Response

