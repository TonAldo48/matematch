import puppeteerCore from 'puppeteer-core';
import { NextResponse } from 'next/server';
import { getPuppeteerConfig } from '@/lib/config/puppeteer';

export const dynamic = 'force-dynamic';

export async function GET() {
    let browser;
    try {
        const isDev = process.env.NODE_ENV === 'development';
        const config = await getPuppeteerConfig(isDev);

        // Launch browser with appropriate configuration
        browser = isDev 
            ? await import('puppeteer').then(puppeteer => puppeteer.default.launch(config))
            : await puppeteerCore.launch(config);

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
            config,
            test: {
                title
            }
        });
    } catch (error) {
        console.error('Setup test error:', error);
        return NextResponse.json({ 
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            environment: process.env.NODE_ENV
        }, { status: 500 });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
} 