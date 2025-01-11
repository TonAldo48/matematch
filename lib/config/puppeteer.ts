import chromium from '@sparticuz/chromium';

export const getPuppeteerConfig = async (isDev: boolean) => {
    const baseConfig = {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-extensions'
        ],
        headless: true
    };

    if (isDev) {
        return baseConfig;
    }

    return {
        ...baseConfig,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    };
}; 