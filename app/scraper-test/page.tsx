'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function ScraperTestPage() {
    const [setupResult, setSetupResult] = useState<any>(null);
    const [scrapeResult, setScrapeResult] = useState<any>(null);
    const [searchUrl, setSearchUrl] = useState('');
    const [loading, setLoading] = useState({
        setup: false,
        scrape: false
    });
    const [error, setError] = useState<string | null>(null);

    const testSetup = async () => {
        setLoading(prev => ({ ...prev, setup: true }));
        setError(null);
        try {
            const response = await fetch('/api/scrape-test');
            const data = await response.json();
            setSetupResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to test setup');
        } finally {
            setLoading(prev => ({ ...prev, setup: false }));
        }
    };

    const testScrape = async () => {
        if (!searchUrl) {
            setError('Please enter a search URL');
            return;
        }

        setLoading(prev => ({ ...prev, scrape: true }));
        setError(null);
        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: searchUrl,
                    mode: 'search'
                }),
            });
            const data = await response.json();
            setScrapeResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to scrape');
        } finally {
            setLoading(prev => ({ ...prev, scrape: false }));
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-2xl font-bold mb-4">Scraper Test Page</h1>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">1. Test Puppeteer Setup</h2>
                <Button 
                    onClick={testSetup}
                    disabled={loading.setup}
                >
                    {loading.setup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Test Setup
                </Button>

                {setupResult && (
                    <div className="mt-4 space-y-2">
                        <h3 className="font-medium">Setup Test Results:</h3>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                            {JSON.stringify(setupResult, null, 2)}
                        </pre>
                    </div>
                )}
            </Card>

            <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">2. Test Scraping</h2>
                <div className="flex gap-4">
                    <Input
                        placeholder="Enter Airbnb search URL"
                        value={searchUrl}
                        onChange={(e) => setSearchUrl(e.target.value)}
                        className="flex-1"
                    />
                    <Button 
                        onClick={testScrape}
                        disabled={loading.scrape}
                    >
                        {loading.scrape && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Test Scrape
                    </Button>
                </div>

                <div className="text-sm text-gray-500">
                    Example URL: https://www.airbnb.com/s/San-Francisco--California--United-States/homes
                </div>

                {scrapeResult && (
                    <div className="mt-4 space-y-2">
                        <h3 className="font-medium">Scrape Results:</h3>
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                            {JSON.stringify(scrapeResult, null, 2)}
                        </pre>
                    </div>
                )}
            </Card>
        </div>
    );
} 