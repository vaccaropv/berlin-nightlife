# Berlin Nightlife App - Architecture & Tech Stack

## Tech Stack Recommendation

### Frontend (The "View")
*   **Framework:** **React + TypeScript (via Vite)**
    *   *Why:* React is the industry standard for dynamic, interactive UIs. Vite ensures lightning-fast development and build times. TypeScript provides type safety, crucial for handling complex event/venue data structures.
*   **Styling:** **Vanilla CSS (CSS Modules / Variables)**
    *   *Why:* Maximum performance and control. We can build a custom, lightweight design system without the overhead of heavy frameworks.
*   **Maps:** **Leaflet (with React-Leaflet)**
    *   *Why:* Lightweight, mobile-friendly, and open-source. We can use custom tile providers (like CartoDB Dark Matter) to achieve the "Citymapper" dark mode look without expensive API keys initially.
*   **State Management:** **Zustand**
    *   *Why:* Simpler and less boilerplate than Redux, perfect for managing global state like "current user", "selected venue", and "map viewport".

### Backend (The "Brain") - *Proposed for Production*
*   **Runtime:** **Node.js + Express**
    *   *Why:* Unified language (JS/TS) across the stack. Excellent ecosystem for scraping and API development.
*   **Database:** **PostgreSQL**
    *   *Why:* Relational data is essential here. Events belong to Venues, Artists belong to Events, Users have Tickets. SQL is the best fit.
*   **ORM:** **Prisma**
    *   *Why:* Type-safe database access that plays perfectly with TypeScript.

### Data Sourcing (Resident Advisor Integration)
*   **Scraper Engine:** **Puppeteer / Cheerio**
    *   *Strategy:* A scheduled background job (Cron) that:
        1.  Visits RA Berlin listings.
        2.  Extracts structured data (JSON-LD often embedded in pages).
        3.  Upserts data into our PostgreSQL database to avoid duplicates.
    *   *Note:* We will use a "Headless Browser" approach to handle dynamic content.

## Architecture Overview

1.  **Client (Mobile/Web):**
    *   **Map-First Interface:** The app opens directly to the map.
    *   **Overlay System:** Event details and lists float over the map (Bottom Sheet on mobile, Sidebar on desktop).
    *   **Offline Capable:** Service Workers cache map tiles and recent events.

2.  **API Layer:**
    *   RESTful endpoints for `/events`, `/venues`, `/artists`.
    *   WebSockets (Socket.io) for real-time updates (e.g., "Ticket availability low", "Club capacity reached").

3.  **Infrastructure:**
    *   **Hosting:** Vercel (Frontend) + Railway/Render (Backend & DB).
    *   **Images:** Cloudinary or AWS S3 for venue photos/flyers.

## Why this fits?
*   **Speed:** Vite + Vanilla CSS = minimal bundle size.
*   **Scalability:** Node/Postgres can handle thousands of concurrent users easily.
*   **Mobile-First:** The "Map + Bottom Sheet" pattern is native-feeling on mobile devices.
