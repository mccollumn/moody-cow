# Production Deployment Guide

## 🚀 Deploying Moody Cow

This guide covers deploying the Moody Cow application to production.

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Spotify Developer account
- Domain name (optional)

### Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/moody_cow?schema=public"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Spotify API
SPOTIFY_CLIENT_ID="your_spotify_client_id"
SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"
SPOTIFY_REDIRECT_URI="https://your-domain.com/auth/callback"

# JWT
JWT_SECRET="your-jwt-secret-here"
```

### Deployment Options

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**

   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**

   - Go to Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from `.env.production`

4. **Set up Database**
   - Use Vercel Postgres or external PostgreSQL service
   - Run migrations: `npx prisma migrate deploy`

#### Option 2: Docker

1. **Build Docker Image**

   ```bash
   docker build -t moody-cow .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 --env-file .env.production moody-cow
   ```

#### Option 3: Traditional Server

1. **Build Application**

   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

### Database Setup

1. **Create Production Database**

   ```sql
   CREATE DATABASE moody_cow;
   CREATE USER moody_cow_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE moody_cow TO moody_cow_user;
   ```

2. **Run Migrations**

   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Spotify API Setup

1. **Create Spotify App**

   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note down Client ID and Client Secret

2. **Configure Redirect URIs**
   - Add your production domain to redirect URIs
   - Format: `https://your-domain.com/auth/callback`

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Use environment variables for all secrets
- [ ] Enable CORS restrictions
- [ ] Set up proper database permissions
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

### Performance Optimization

- [ ] Enable Next.js image optimization
- [ ] Configure CDN for static assets
- [ ] Set up caching for API responses
- [ ] Optimize database queries
- [ ] Enable compression
- [ ] Set up monitoring

### Monitoring

Consider setting up:

- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Database monitoring
- Uptime monitoring

### Troubleshooting

#### Common Issues

1. **Database Connection Errors**

   - Check DATABASE_URL format
   - Verify network connectivity
   - Check firewall settings

2. **Spotify API Errors**

   - Verify client credentials
   - Check redirect URI configuration
   - Ensure proper scopes are requested

3. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure database schema is up to date

### Backup Strategy

1. **Database Backups**

   ```bash
   # Daily backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **Environment Configuration Backup**
   - Store environment variables securely
   - Document all configuration changes

### Scaling Considerations

- Use connection pooling for database
- Consider Redis for session storage
- Set up load balancing for multiple instances
- Monitor resource usage and scale accordingly

---

For more deployment options and detailed configurations, refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment).
