import { Injector } from './decorators';
import { ExpressTestServer } from './tests/server';

describe('Injection decorators', () => {

    it('Create server', async () => {
        const module = Injector.get(ExpressTestServer);
        expect(module).toBeDefined();
    });
});
