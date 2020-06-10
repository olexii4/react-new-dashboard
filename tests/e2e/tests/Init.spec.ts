import { testContainer } from '../inversify.config';
import { IDriver } from '../driver/IDriver';
import { TYPES } from '../inversify.types';
import { ThenableWebDriver } from 'selenium-webdriver';


const testDriver: IDriver = testContainer.get(TYPES.Driver)

suite('Suite', async () => {
    test('Test', async () => {

        const driver: ThenableWebDriver = testDriver.get();
        
        await driver.navigate().to('https://www.google.com/');



    });
});
