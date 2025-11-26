# Enhanced Community Feed - Integration Guide

## Overview

The enhanced community feed system is now complete and ready to integrate into your application. This guide shows you how to add it to your navigation and start using it.

---

## Prerequisites

### 1. Run Database Migrations

First, run the SQL migrations in your Supabase dashboard:

```bash
# Open Supabase SQL Editor and run:
/Users/pedrovaccaro/.gemini/antigravity/berlin-nightlife/supabase_migrations_enhanced_feed.sql
```

This will create:
- `news` table
- `report_votes` table  
- `report_flags` table
- Enhanced `status_reports` with photos, vote counts
- Views and triggers for confidence calculation

### 2. Verify Supabase Client

Ensure your Supabase client is properly configured in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);
```

---

## Integration Steps

### Step 1: Add to Navigation

Update `App.tsx` to include the feed tab:

```typescript
// Add to ActiveTab type
type ActiveTab = 'map' | 'events' | 'timeline' | 'feed' | 'profile';

// Import UnifiedFeed
import UnifiedFeed from './components/CommunityFeed/UnifiedFeed';

// Add to render
{activeTab === 'feed' && (
    <UnifiedFeed
        userLocation={userLocation}
        onVenueClick={(venueId) => {
            const venue = MOCK_VENUES.find(v => v.id === venueId);
            if (venue) handleVenueClick(venue);
        }}
    />
)}

// Add to bottom navigation
<div className="bottom-nav glass-panel">
    {/* ... existing tabs ... */}
    <div
        className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => setActiveTab('feed')}
    >
        Feed
    </div>
</div>
```

### Step 2: Verify AuthContext

The feed uses `useAuth()` hook for user authentication. Ensure your `AuthContext` is set up:

```typescript
// src/contexts/AuthContext.tsx
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

---

## Component Usage

### UnifiedFeed

Main container component:

```typescript
<UnifiedFeed
    userLocation={[52.5200, 13.4050]} // Optional: Berlin coordinates
    onVenueClick={(venueId) => {
        // Handle venue click
    }}
/>
```

**Props:**
- `userLocation?: [number, number]` - User's coordinates for "Nearby" sorting
- `onVenueClick?: (venueId: string) => void` - Callback when venue is clicked

### ReportCard

Individual report display (used internally by UnifiedFeed):

```typescript
<ReportCard
    report={enhancedReport}
    userVote={userVote}
    onVote={(reportId, voteType) => {}}
    onFlag={(reportId) => {}}
    onShare={(reportId) => {}}
    onVenueClick={(venueId) => {}}
/>
```

### NewsCard

News article display (used internally by UnifiedFeed):

```typescript
<NewsCard
    news={newsItem}
    onVenueClick={(venueId) => {}}
    onShare={(newsId) => {}}
/>
```

---

## API Usage

### Feed API

```typescript
import { getUnifiedFeed, subscribeToFeed } from './lib/communityFeed/feedApi';

// Fetch feed items
const items = await getUnifiedFeed(
    { filter: 'all', sort: 'recent' },
    20,  // limit
    0,   // offset
    userLocation
);

// Subscribe to real-time updates
const subscription = subscribeToFeed(() => {
    // Reload feed
});

// Cleanup
subscription.unsubscribe();
```

### Voting API

```typescript
import { voteReport, getUserVotes, flagReport } from './lib/communityFeed/votingApi';

// Vote on report
await voteReport(reportId, userId, 'helpful');

// Get user's votes
const votes = await getUserVotes(userId);

// Flag report
await flagReport(reportId, userId, 'spam', 'Details...');
```

---

## Features

### ✅ Implemented

- **News Integration**: Admin/venue/scraped news articles
- **Voting System**: Helpful/unhelpful votes with optimistic UI
- **Confidence Badges**: High/medium/low based on report volume
- **Freshness Indicators**: Color-coded dots (green/yellow/gray)
- **Photo Galleries**: Swipeable image carousels with lightbox
- **Flag/Share Actions**: Moderation and sharing capabilities
- **Real-time Updates**: Supabase subscriptions for live feed
- **Filtering**: All, News, Reports, Nearby
- **Sorting**: Recent, Most Helpful, Nearby
- **Infinite Scroll**: Automatic pagination
- **Mobile Optimized**: Responsive design with touch support
- **Dark Mode**: Automatic theme support

---

## Testing

### 1. Add Sample Data

Insert test news and reports via Supabase SQL Editor:

```sql
-- Sample news
INSERT INTO news (title, content, source, venue_id, tags, priority) VALUES
('Test News', 'This is a test news article', 'admin', NULL, ARRAY['test'], 5);

-- Sample report with photos
UPDATE status_reports 
SET photos = ARRAY['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
WHERE id = 'your-report-id';
```

### 2. Test Voting

1. Log in as a user
2. Click helpful/unhelpful on a report
3. Verify optimistic UI update
4. Check vote persists after refresh

### 3. Test Real-time

1. Open feed in two browser windows
2. Submit a new report in one window
3. Verify it appears in the other window automatically

---

## Customization

### Styling

All components use vanilla CSS files that can be customized:

- `ReportCard.css` - Report card styling
- `NewsCard.css` - News card styling
- `UnifiedFeed.css` - Feed container styling
- `PhotoGallery.css` - Photo gallery and lightbox
- `ConfidenceBadge.css` - Confidence badge colors
- `FreshnessDot.css` - Freshness indicator colors

### Colors

Update confidence badge colors in `ConfidenceBadge.css`:

```css
.confidence-badge.high {
    background: rgba(57, 255, 20, 0.15);
    color: #39ff14;
}
```

Update freshness dot colors in `FreshnessDot.css`:

```css
.freshness-dot.fresh .dot {
    background: #39ff14; /* <30 min */
}
```

---

## Troubleshooting

### Feed Not Loading

1. Check Supabase connection
2. Verify migrations ran successfully
3. Check browser console for errors
4. Ensure RLS policies allow read access

### Voting Not Working

1. Verify user is authenticated
2. Check `report_votes` table exists
3. Verify RLS policies allow insert/update
4. Check browser console for API errors

### Real-time Not Updating

1. Verify Supabase Realtime is enabled
2. Check subscription in browser DevTools
3. Ensure table has REPLICA IDENTITY FULL
4. Verify channel subscription is active

---

## Next Steps

### Optional Enhancements

1. **Virtualized Scrolling**: Add `react-window` for 100+ items
2. **Image Upload**: Allow users to upload photos
3. **Rich Text Editor**: For news content
4. **Push Notifications**: Notify users of new reports
5. **Analytics**: Track vote patterns and engagement

---

## File Structure

```
src/
├── components/
│   └── CommunityFeed/
│       ├── UnifiedFeed.tsx          # Main container
│       ├── UnifiedFeed.css
│       ├── ReportCard.tsx           # Report display
│       ├── ReportCard.css
│       ├── NewsCard.tsx             # News display
│       ├── NewsCard.css
│       ├── PhotoGallery.tsx         # Photo carousel
│       ├── PhotoGallery.css
│       ├── ConfidenceBadge.tsx      # Confidence indicator
│       ├── ConfidenceBadge.css
│       ├── FreshnessDot.tsx         # Freshness indicator
│       └── FreshnessDot.css
├── lib/
│   └── communityFeed/
│       ├── types.ts                 # TypeScript types
│       ├── feedApi.ts               # Feed data fetching
│       └── votingApi.ts             # Voting & flagging
└── supabase_migrations_enhanced_feed.sql  # Database migrations
```

---

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Supabase dashboard for data
3. Review RLS policies in Supabase
4. Check network tab for failed requests

The feed system is fully modular and can be used alongside your existing timeline feature!
