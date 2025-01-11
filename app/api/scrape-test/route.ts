import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import { NextResponse } from 'next/server';

export async function GET() {
    let browser;
    try {
        // Test chromium setup
        const executablePath = await chromium.executablePath();
        console.log('Chromium executable path:', executablePath);

        // Test browser launch
        browser = await puppeteerCore.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: chromium.headless
        });
        console.log('Browser launched successfully');

        // Test page creation
        const page = await browser.newPage();
        console.log('Page created successfully');

        // Test navigation
        await page.goto('https://example.com');
        console.log('Navigation successful');

        // Test content extraction
        const title = await page.title();
        console.log('Page title extracted:', title);

        return NextResponse.json({ 
            success: true,
            environment: process.env.NODE_ENV,
            chromium: {
                executablePath,
                args: chromium.args,
                headless: chromium.headless
            },
            test: {
                title
            }
        });
    } catch (error) {
        console.error('Setup test error:', error);
        return NextResponse.json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: process.env.NODE_ENV,
            chromium: {
                executablePath: await chromium.executablePath(),
                args: chromium.args,
                headless: chromium.headless
            }
        }, { status: 500 });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
} 