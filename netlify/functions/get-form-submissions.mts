import type { Context, Config } from "@netlify/functions";
import { neon } from '@netlify/neon';

export default async (req: Request, context: Context) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Initialize Neon database connection
    const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL
    
    console.log('Connecting to Neon database...');
    
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
    
    console.log('Table created/verified successfully');
    
    // Fetch all movie reviews from the database
    const reviews = await sql`
      SELECT id, name, movie_name, movie_review, submitted_at 
      FROM movie_reviews 
      ORDER BY submitted_at DESC
    `;
    
    console.log(`Successfully fetched ${reviews.length} reviews from database`);
    
    // Transform the data to match frontend expectations
    const transformedReviews = reviews.map((review: any) => ({
      id: review.id,
      name: review.name,
      movieName: review.movie_name,
      movieReview: review.movie_review,
      submittedAt: new Date(review.submitted_at).toLocaleDateString()
    }));

    return new Response(JSON.stringify(transformedReviews), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown database error',
      message: 'Unable to fetch movie reviews from database'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/form-submissions"
}; 