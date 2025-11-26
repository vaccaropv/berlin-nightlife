# Berlin Nightlife Server

Backend API for scraping event data from Berlin nightlife venues.

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/events/:venueId` - Get events for a specific venue
- `POST /api/cache/clear` - Clear the cache (development only)

## Supported Venues

- `tresor` - Tresor Berlin
- `berghain` - Berghain/Panorama Bar

## Notes

- Events are cached for 1 hour to avoid excessive scraping
- Fallback data is provided if scraping fails
- RA scraper placeholder is ready for future implementation
