# Moody Cow Development Setup

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Set up database**

   ```bash
   ./setup-db.sh
   ```

4. **Download face detection models**

   ```bash
   ./download-models.sh
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Required API Credentials

### Spotify API

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Copy Client ID and Client Secret to `.env`

### Database

- Set up PostgreSQL locally or use a cloud service
- Update `DATABASE_URL` in `.env`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Database operations
npx prisma migrate dev    # Create and apply migration
npx prisma studio        # Open database browser
npx prisma generate      # Generate Prisma client
```

## Project Structure

```
app/                    # Next.js App Router
├── (auth)/            # Authentication pages
├── api/               # API routes
├── components/        # React components
└── profile/           # User profile

lib/                   # Shared utilities
├── features/          # Redux slices
└── services/          # External service integrations

prisma/                # Database schema
tests/                 # Jest unit tests
tests/e2e/            # Playwright E2E tests
```

## Testing

### Unit Tests (Jest)

```bash
npm run test
npm run test:watch
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui
```

## Troubleshooting

### Face Detection Issues

- Ensure models are downloaded: `./download-models.sh`
- Check browser camera permissions
- Verify HTTPS for camera access in production

### Spotify API Issues

- Verify credentials in `.env`
- Check redirect URI configuration
- Ensure app is not in development mode restrictions

### Database Issues

- Run `./setup-db.sh` to initialize
- Check PostgreSQL is running
- Verify connection string format
