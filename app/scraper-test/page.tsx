'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrapedListing } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ScraperTest() {
  const [url, setUrl] = useState('');
  const [listings, setListings] = useState<ScrapedListing[]>([]);
  const [singleListing, setSingleListing] = useState<ScrapedListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'single'>('search');
  const { toast } = useToast();

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, mode }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to scrape data');
      }

      if (mode === 'search') {
        setListings(result.data);
        setSingleListing(null);
      } else {
        setSingleListing(result.data);
        setListings([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to scrape data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Airbnb Scraper Test</h1>
      
      <Tabs value={mode} onValueChange={(value) => setMode(value as 'search' | 'single')} className="mb-6">
        <TabsList>
          <TabsTrigger value="search">Search Results</TabsTrigger>
          <TabsTrigger value="single">Single Listing</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 mb-8">
        <Input
          placeholder={mode === 'search' ? "Enter Airbnb search URL..." : "Enter Airbnb listing URL..."}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleScrape} disabled={loading}>
          {loading ? 'Scraping...' : 'Scrape'}
        </Button>
      </div>

      {singleListing && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{singleListing.title}</CardTitle>
            <p className="text-sm text-gray-500">{singleListing.location}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {singleListing.images.slice(0, 4).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${singleListing.title} - Image ${i + 1}`}
                  className="w-full h-48 object-cover rounded-md"
                />
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Price</h3>
                <p>{singleListing.price.currency}{singleListing.price.amount} per {singleListing.price.period}</p>
              </div>
              <div>
                <h3 className="font-semibold">Details</h3>
                <p>{singleListing.details.guests} guests • {singleListing.details.bedrooms} bedrooms • {singleListing.details.bathrooms} bathrooms</p>
              </div>
              <div>
                <h3 className="font-semibold">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {singleListing.amenities.map((amenity, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-1 rounded-md text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm">{singleListing.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{listing.title}</CardTitle>
              <p className="text-sm text-gray-500">{listing.location}</p>
            </CardHeader>
            <CardContent>
              {listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <div className="space-y-2">
                <p className="font-semibold">
                  {listing.price.currency}{listing.price.amount} per {listing.price.period}
                </p>
                <a 
                  href={listing.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  View on Airbnb
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 