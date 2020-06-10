import { testContainer } from '../inversify.config';
import { ThenableWebDriver } from 'selenium-webdriver';
import { DriverHelper } from '../utils/DriverHelper';
import { CLASSES } from '../inversify.types';


const driverHelper: DriverHelper = testContainer.get(CLASSES.DriverHelper);

suite('Suite', async () => {
    test('Test', async () => {

        await driverHelper.getDriver().navigate().to('https://www.google.com/');



    });
});
