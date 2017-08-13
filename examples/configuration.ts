import { Player } from './controllers/player';
import { Server, MethodulusConfig, MethodulusClassConfig, MethodType } from '../index';







let config = new MethodulusConfig();
config.run(Methodulus.ServerType.Express, {port:process.env.PORT || 8020 });

config.use(Player, MethodType.Local, 'http://127.0.0.1:8090')
//config.classes.set('TestClass', new MethodulusClassConfig('TestClass', MethodType.Http));
const server = new Server(process.env.PORT || 8020).configure(config).start();
//server.useClass(Player);


setTimeout(() => {

    console.log(`
--------------------------------------------------------------------------------------------
every thing is ready, your server is active at: 
http://127.0.0.1:${process.env.PORT || 8020}/api/player


try browsing to
http://127.0.0.1:${process.env.PORT || 8020}/api/player/1
`)


}, 2000)