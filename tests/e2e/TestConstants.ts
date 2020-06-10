/*
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

export const TestConstants = {
    /**
     * Base URL of the application which should be checked
     */
    TEST_BASE_URL: process.env.TEST_BASE_URL || 'http://sample-url',

    /**
     * Run browser in "Headless" (hiden) mode, "false" by default.
     */
    TEST_HEADLESS: process.env.TEST_HEADLESS === 'true',

    /**
     * Run browser with an enabled or disabled W3C protocol (on Chrome  76 and upper, it is enabled by default), "true" by default.
     */
    TEST_W3C_CHROME_OPTION: process.env.TEST_W3C_CHROME_OPTION !== 'false',

    /**
     * Browser width resolution, "1920" by default.
     */
    TEST_RESOLUTION_WIDTH: Number(process.env.TEST_RESOLUTION_WIDTH) || 1920,

    /**
     * Browser height resolution, "1080" by default.
     */
    TEST_RESOLUTION_HEIGHT: Number(process.env.TEST_RESOLUTION_HEIGHT) || 1080,

    /**
     * Remote driver URL.
     */
    TEST_REMOTE_DRIVER_URL: process.env.TEST_REMOTE_DRIVER_URL || ''


};
