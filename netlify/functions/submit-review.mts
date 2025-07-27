import type { Context, Config } from "@netlify/functions";
import { neon } from '@netlify/neon';

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse form data
    let formData: any = {};
    
    const contentType = req.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      formData = await req.json();
    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      formData = Object.fromEntries(params);
    } else {
      throw new Error('Unsupported content type');
    }

    console.log('Received form data:', formData);

    // Validate required fields
    const { name, 'movie-name': movieName, 'movie-review': movieReview } = formData;
    
    if (!name || !movieName || !movieReview) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'Please provide name, movie name, and movie review'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
    
    // Insert the new review into the database
    const [newReview] = await sql`
      INSERT INTO movie_reviews (name, movie_name, movie_review)
      VALUES (${name}, ${movieName}, ${movieReview})
      RETURNING id, name, movie_name, movie_review, submitted_at
    `;
    
    console.log('Successfully saved review to database:', newReview.id);
    
    // Return success response
    return new Response(JSON.stringify({
      success: true,
      message: 'Movie review submitted successfully!',
      data: {
        id: newReview.id,
        name: newReview.name,
        movieName: newReview.movie_name,
        movieReview: newReview.movie_review,
        submittedAt: new Date(newReview.submitted_at).toLocaleDateString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error saving review:', error);
    return new Response(JSON.stringify({ 
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to save movie review'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/submit-review"
}; 