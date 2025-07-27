// Next.js API route for development mode
// This provides a fallback when Netlify Functions aren't available

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In development mode, return empty submissions since we don't have access to Netlify API
  // This allows the frontend to work without errors
  res.status(200).json({
    message: 'Running in development mode',
    info: 'Form submissions will be available when deployed to Netlify',
    submissions: []
  });
} 