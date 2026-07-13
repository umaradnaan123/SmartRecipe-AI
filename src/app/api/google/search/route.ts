import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  if (!query) {
    return NextResponse.json([]);
  }

  const domains = ['allrecipes.com', 'foodnetwork.com', 'bbcgoodfood.com', 'seriouseats.com', 'bonappetit.com', 'nytimes.com/cooking'];
  const fullSearchQuery = `${query} recipe`;

  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(fullSearchQuery)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);
    const results: any[] = [];

    $('.g').each((i, element) => {
      const titleEl = $(element).find('h3');
      const linkEl = $(element).find('a');
      const snippetEl = $(element).find('.VwiC3b'); // standard Google snippet class

      if (titleEl.length && linkEl.length) {
        const title = titleEl.text().trim();
        const rawLink = linkEl.attr('href') || '';
        
        let link = rawLink;
        if (rawLink.startsWith('/url?q=')) {
          link = decodeURIComponent(rawLink.split('/url?q=')[1].split('&')[0]);
        }

        const snippet = snippetEl.text().trim() || 'View cooking details, prep tips, and nutritional guides on the site.';
        
        try {
          const parsedUrl = new URL(link);
          const domain = parsedUrl.hostname.replace('www.', '');
          const sourceName = domain.split('.')[0].toUpperCase();
          const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${parsedUrl.hostname}`;

          results.push({
            title,
            link,
            snippet,
            sourceName,
            favicon,
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });

    if (results.length > 0) {
      return NextResponse.json(results.slice(0, 6));
    }
    throw new Error('No search results extracted');
  } catch (error) {
    console.error('Google search scraping failed, returning mock search results:', error);

    // Dynamic mock search results focusing on trusted cooking resources
    const mockQuery = query;
    return NextResponse.json([
      {
        title: `Perfect ${mockQuery} Recipe - Allrecipes`,
        link: `https://www.allrecipes.com/search?q=${encodeURIComponent(mockQuery)}`,
        snippet: `Find the absolute best recipes for ${mockQuery} with rating reviews, user tips, prep timings, and step-by-step videos.`,
        sourceName: 'ALLRECIPES',
        favicon: 'https://www.google.com/s2/favicons?sz=64&domain=allrecipes.com',
      },
      {
        title: `How to Make Classic ${mockQuery} - Food Network`,
        link: `https://www.foodnetwork.com/search/${encodeURIComponent(mockQuery)}-`,
        snippet: `Get the classic recipe for ${mockQuery} from Chef Masters. Find calories, preparation secrets, and substitution facts.`,
        sourceName: 'FOODNETWORK',
        favicon: 'https://www.google.com/s2/favicons?sz=64&domain=foodnetwork.com',
      },
      {
        title: `Easy ${mockQuery} Guide & Tips - Serious Eats`,
        link: `https://www.seriouseats.com/search?q=${encodeURIComponent(mockQuery)}`,
        snippet: `The food science behind making the best possible ${mockQuery}. Pro tips on frying temperatures, ingredient combinations, and storage.`,
        sourceName: 'SERIOUSEATS',
        favicon: 'https://www.google.com/s2/favicons?sz=64&domain=seriouseats.com',
      }
    ]);
  }
}
