# Setup Guide for Netlify Form Submissions

This guide will help you set up the movie review form to display all submissions from Netlify Forms.

## Prerequisites

1. Your site must be deployed on Netlify
2. You need access to your Netlify account
3. The movie review form must be working and receiving submissions

## Step 1: Create a Netlify Personal Access Token

1. Go to [Netlify User Applications](https://app.netlify.com/user/applications#personal-access-tokens)
2. Click "New access token"
3. Give it a descriptive name like "Movie Review Form API"
4. Copy the generated token (you won't be able to see it again)

## Step 2: Set Environment Variables

### For Local Development:
Create a `.env.local` file in your project root:

```bash
NETLIFY_ACCESS_TOKEN=your_access_token_here
```

### For Production (Netlify Deploy):
1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add a new variable:
   - **Key**: `NETLIFY_ACCESS_TOKEN`
   - **Value**: Your personal access token

## Step 3: Deploy or Test Locally

### Local Testing:
```bash
npm install
netlify dev
```

### Production Deploy:
Push your changes to your connected Git repository, and Netlify will automatically deploy.

## How It Works

- The `/api/form-submissions` endpoint fetches all submissions from your Netlify form
- The frontend automatically loads and displays these submissions in a table
- New submissions appear after clicking the refresh button or submitting a new review
- All data comes directly from Netlify Forms (no local storage)

## Development Modes

The app now supports two development modes:

### Next.js Only Mode (Recommended for local development)
```bash
npm run dev
```
- Runs on http://localhost:3000 (or next available port)  
- Form submissions work but don't persist (development mode)
- No Netlify credentials required
- Perfect for UI development and testing

### Netlify Dev Mode (Full environment simulation)
```bash
netlify dev
```
- Runs on http://localhost:8888
- Simulates full Netlify environment
- Requires Netlify credentials for form submissions viewing
- Best for testing before deployment

## Troubleshooting

**Error: "Netlify API error: 401 Unauthorized"**
- This means the `NETLIFY_ACCESS_TOKEN` is missing or invalid
- The app will still work but submissions viewing will be limited
- Set up the environment variable as described in Step 2 above

**Error: "Access token not configured"**
- Make sure you've set the `NETLIFY_ACCESS_TOKEN` environment variable
- Verify the token is correct and has not expired

**Error: "Site ID not found"**
- This usually auto-detects from Netlify context
- If needed, you can manually set `NETLIFY_SITE_ID` in your environment variables

**No submissions showing**
- Ensure your form is named `movie-review` (matches the API call)
- Check that you have actual form submissions in your Netlify dashboard
- Verify the form fields are named: `name`, `movie-name`, `movie-review`

**Yarn configuration errors**
- This project uses npm, not yarn
- Remove any `.yarnrc.yml` files if present
- Use `npm install` instead of `yarn install`

## Security Note

Never commit your access token to Git. Always use environment variables and keep your `.env.local` file in your `.gitignore`. 