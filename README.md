# Memory Book

Memory Book is a full-stack digital memory archival web application built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and Supabase. The application allows users to organize memories into curated collections, featuring an interactive 3D page-flipping book viewer. It provides CRUD operations for collections and individual memory pages, cloud image storage, search, multi-criterion sorting, and responsive layout across desktop and mobile devices.

## Application Architecture and Analysis

The application is structured around Next.js App Router conventions, combining React Server Components (RSC) for initial page loads and Server Actions for data mutations and file management.

1. Data Layer: Backed by Supabase PostgreSQL with Row Level Security (RLS) policies. Schema comprises two primary entities:
   - collections: Stores memory collections (name, description, poster_url, start_time, end_time, created_at).
   - collection_items: Stores individual memory records nested within a collection (name, description, image_url, order, memory_date, created_at) with foreign key cascade deletion.
2. Storage Layer: Supabase Storage (attachments bucket) for storing collection posters and memory photographs, with automatic cleanup of replaced or deleted assets.
3. Interactive Flipbook Engine: Implemented using react-pageflip to render an interactive book format featuring hardcover bindings, cover pages, table of contents, dual-page spreads on desktop, single-page presentation on mobile, and flip controls.
4. Client State and UI: Framer Motion for animations and transitions; dynamic search toolbar with multi-attribute sorting; pagination; and fullscreen image preview modals.

## Features & Capabilities

- Collection Management:
  - Create, view, update, and delete memory collections.
  - Event date range tracking (start date to end date).
  - Custom poster image upload with fallback to direct path or placeholder graphics.
- Realistic 3D Memory Book:
  - Interactive book simulation with realistic page-turning physics.
  - Front cover displaying collection title, cover graphic, and description.
  - Interactive Table of Contents with jump links to specific memory entries.
  - Dual-page spread on desktop screens and single-page flip layout on mobile devices.
  - Keyboard navigation and button navigation.
  - Direct addition, editing, and deletion of individual memory pages inside the book viewer.
- Granular Memory Items:
  - Each item supports title, detailed narrative, date of memory, custom order index, and photograph.
  - Automatic ordering and index preservation.
- Search, Filter, and Sorting Toolbar:
  - Real-time client-side search across collection titles and descriptions.
  - Sorting options: Creation Date (Newest/Oldest), Event Date (Earliest/Latest), Alphabetical (A-Z/Z-A), and Memory Count (Most/Fewest).
  - Search reset button and match counter indicator.
- Pagination:
  - Page-based navigation for collection libraries.
- Image Lightbox Preview:
  - Modal viewer for viewing full-size high-resolution memories.
- Responsive Design and Design Tokens:
  - Centralized color and typography design tokens (app/constants/design-tokens.ts).
  - Responsive layouts supporting mobile, tablet, and desktop breakpoints.

## Folder Structure

```
├── app/
│   ├── actions/                       # Next.js Server Actions
│   │   ├── collection.ts              # Collection CRUD and poster storage handlers
│   │   └── collection_items.ts        # Memory item CRUD and image storage handlers
│   ├── components/                    # UI and Client Components
│   │   ├── CollectionCard.tsx         # Collection card component with actions
│   │   ├── CollectionListSection.tsx  # Collection grid, search, sort, pagination, modals
│   │   ├── CollectionToolbar.tsx      # Search input, sorting dropdown, count badge
│   │   ├── CreateCollectionModal.tsx  # Form modal for creating collections
│   │   ├── CreateMemoryItemModal.tsx  # Form modal for adding memory pages
│   │   ├── EditCollectionModal.tsx    # Form modal for updating collections
│   │   ├── EditMemoryItemModal.tsx    # Form modal for editing memory pages
│   │   ├── HeroSection.tsx            # Animated hero section with parallax background
│   │   ├── ImagePreviewModal.tsx      # Fullscreen image lightbox modal
│   │   ├── MemoryBookModal.tsx        # Flipbook engine (react-pageflip), pages, controls
│   │   ├── Navbar.tsx                 # Floating blur navigation bar with scroll tracking
│   │   └── Pagination.tsx             # Collection pagination controls
│   ├── constants/
│   │   └── design-tokens.ts           # Centralized color tokens and Tailwind utilities
│   ├── helpers/
│   │   └── file_url.ts                # Supabase storage URL resolution helper
│   ├── types/
│   │   ├── collection.ts              # Collection TypeScript definitions and schemas
│   │   ├── collection_item.ts         # CollectionItem TypeScript definitions and schemas
│   │   └── database.types.ts          # Generated Supabase database schema types
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts              # Browser Supabase client (createBrowserClient)
│   │       ├── server.ts              # Server Supabase client (createServerClient)
│   │       └── proxy.ts               # Proxy utilities
│   ├── globals.css                    # Tailwind CSS v4 stylesheet imports
│   ├── layout.tsx                     # Root layout, Geist font, document metadata
│   └── page.tsx                       # Home page (Server Component prefetching collections)
├── public/                            # Static assets and SVG icons
├── supabase/
│   ├── config.toml                    # Supabase CLI local configuration
│   └── migrations/                    # SQL migrations and RLS policies
├── next.config.ts                     # Next.js configuration
├── package.json                       # Dependencies, scripts, and project metadata
├── postcss.config.mjs                 # PostCSS configuration for Tailwind v4
└── tsconfig.json                      # TypeScript configuration
```

## Tech Stack / Prerequisites

### Technologies Used

| Layer | Technology | Version / Details |
| --- | --- | --- |
| Framework | Next.js | 16.3.4 (App Router, Server Actions) |
| UI Library | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x (@tailwindcss/postcss) |
| Animation | Framer Motion | 13.1.1 |
| Flipbook Engine | react-pageflip | 2.0.3 |
| Form Management | React Hook Form | 7.87.0 |
| Backend & Database | Supabase (PostgreSQL) | @supabase/supabase-js, @supabase/ssr |
| Package Manager | pnpm | 11.3.0 |

### Prerequisites

- Node.js: v20.x or higher
- Package Manager: pnpm v9 or higher (recommended: pnpm v11)
- Supabase instance (cloud or local Supabase CLI)

## Installation & Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd memory-book
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Set up database schema and storage bucket:
   - Execute the SQL migration located at `supabase/migrations/20260902081732_table_rls_setting_up.sql` against your PostgreSQL database.
   - Create a public storage bucket named `attachments` in Supabase Storage with appropriate read/write policies.

5. Run the local development server:
   ```bash
   pnpm dev
   ```

6. Open the application:
   Access `http://localhost:3000` in your browser.

## Usage Examples / API Endpoints

The application utilizes Next.js Server Actions for direct server-side data mutations and queries.

### Collection Actions (`app/actions/collection.ts`)

- `getAllCollectionsWithCollectionItems()`: Queries all collections including related collection items ordered by item order ascending.
- `createNewCollection(collection: CollectionInsert)`: Inserts a new collection row.
- `updateCollection(collection: Partial<Collection> & { id: string })`: Updates fields of an existing collection by ID.
- `deleteCollection(collectionId: string)`: Deletes a collection and cascades deletion to all child items.
- `updateCollectionPoster(collection: { id: string; poster_url?: string | null }, posterFile: File | null)`: Handles file upload to the `attachments` storage bucket and updates collection `poster_url`.

### Memory Item Actions (`app/actions/collection_items.ts`)

- `createNewCollectionItem(collectionItem: CollectionItemInsert)`: Inserts a new memory item row linked to a collection.
- `updateCollectionItem(collectionItem: Partial<CollectionItem> & { id: string })`: Updates memory details (name, description, order, memory_date).
- `deleteCollectionItem(itemId: string)`: Removes a memory item by ID.
- `updateCollectionItemPoster(collectionItem: CollectionItem, posterFile: File | null)`: Handles memory image uploads to Supabase Storage and updates `image_url`.

## Deployment Instructions

### Vercel Deployment

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project into the Vercel dashboard.
3. Configure the following environment variables in project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Trigger deployment. Next.js App Router and Server Actions will be configured automatically by Vercel.

### Node.js Production Server

1. Build the production bundle:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```
   The application will serve on port 3000 by default. Set the `PORT` environment variable to override.

### Container Deployment (Docker)

1. Enable standalone output in `next.config.ts`:
   ```typescript
   const nextConfig = {
     output: 'standalone',
   };
   export default nextConfig;
   ```
2. Build container image copying `.next/standalone`, `.next/static`, and `public/`.
3. Run container exposing the target port with required Supabase environment variables injected.

## License

This project is licensed under the MIT License.
