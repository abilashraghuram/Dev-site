// Next.js API route for development mode
// This provides a fallback when Netlify Functions aren't available
import { neon } from '@netlify/neon';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if database URL is available
    if (!process.env.NETLIFY_DATABASE_URL) {
      // Fallback for pure development mode without database
      return res.status(200).json({
        message: 'Running in development mode',
        info: 'Database not configured. Deploy to Netlify to enable persistent storage.',
        submissions: []
      });
    }

    // Initialize Neon database connection
    const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL
    
    console.log('Connecting to Neon database from Next.js API...');
    
    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS movie_reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        movie_name VARCHAR(255) NOT NULL,
        movie_review TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Fetch all movie reviews from the database
    const reviews = await sql`
      SELECT id, name, movie_name, movie_review, submitted_at 
      FROM movie_reviews 
      ORDER BY submitted_at DESC
    `;
    
    console.log(`Successfully fetched ${reviews.length} reviews from database`);
    
    // Transform the data to match frontend expectations
    const transformedReviews = reviews.map((review) => ({
      id: review.id,
      name: review.name,
      movieName: review.movie_name,
      movieReview: review.movie_review,
      submittedAt: new Date(review.submitted_at).toLocaleDateString()
    }));

    res.status(200).json(transformedReviews);

  } catch (error) {
    console.error('Database error in Next.js API:', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message,
      message: 'Unable to fetch movie reviews from database'
    });
  }
} 