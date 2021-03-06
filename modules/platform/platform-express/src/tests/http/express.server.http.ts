process.env.test = 'true';
import decorators from '@methodus/server/decorators';
import { ConfiguredServer } from '@methodus/server';
import { ExpressTestModule } from '../servers/express.module';
import { Express, ExpressOptions } from '../../index';
import { TestTarget } from '../controllers/target.test';
import { Http } from '@methodus/platform-rest';

const options: ExpressOptions = {
    port: process.env.PORT || 8030,
    secured: false,
    fileUpload: true,
    cors: false
}

@decorators.ServerConfiguration(Express, options)
// @PluginConfiguration('@methodus/describe')
@decorators.ModuleConfiguration(ExpressTestModule)
@decorators.ClientConfiguration(TestTarget, Http, 'http://localhost:8030')
export class ExpressTestServer extends ConfiguredServer {
    constructor() {
        super(ExpressTestServer);
    }
}
(() => {
    if (process.env.TESTMODE === 'run') {
        return new ExpressTestServer();
    }
    return;
})();


