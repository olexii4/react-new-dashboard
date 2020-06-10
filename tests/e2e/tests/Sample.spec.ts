import { testContainer } from '../inversify.config';
import { DriverHelper } from '../utils/DriverHelper';
import { CLASSES } from '../inversify.types';


const driverHelper: DriverHelper = testContainer.get(CLASSES.DriverHelper);

suite('Suite', async () => {
    test('Test', async () => {

        await driverHelper.getDriver().navigate().to('https://www.google.com/');



    });
});
