This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Configuration

This project requires an environment variable to configure the API base URL. The application uses different API endpoints for local development and production.

### Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. The `.env.local` file is already configured with:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

3. This assumes your local API server is running on port 3001. If your server runs on a different port, update `.env.local` accordingly.

4. The `.env.local` file is gitignored and will be used automatically when running `npm run dev`.

### Production Deployment (Vercel)

When deploying to Vercel, you need to set the production API URL as an environment variable:

1. Go to your Vercel project dashboard
2. Navigate to **Project Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Key**: `NEXT_PUBLIC_API_BASE_URL`
   - **Value**: `https://linear-algebra-pro-server.vercel.app`
   - **Environment**: Select "Production" (and optionally "Preview" if you want it for preview deployments)

4. After adding the environment variable, redeploy your application for the changes to take effect.

**Note**: The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser. Without this prefix, the variable will only be available on the server side.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
