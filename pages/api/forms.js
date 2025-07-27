// Next.js API route for handling form submissions in development mode
// This provides a fallback when Netlify Functions aren't available
import { neon } from '@netlify/neon';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, 'movie-name': movieName, 'movie-review': movieReview } = req.body;
    
    // Validate required fields
    if (!name || !movieName || !movieReview) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Please provide name, movie name, and movie review'
      });
    }

    // Check if database URL is available
    if (!process.env.NETLIFY_DATABASE_URL) {
      // Fallback for pure development mode without database
      console.log('Form submission received (dev mode - no database):', {
        name,
        movieName,
        movieReview,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        message: 'Form submitted successfully (development mode - no persistence)',
        data: { name, movieName, movieReview }
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
    
    // Insert the new review into the database
    const [newReview] = await sql`
      INSERT INTO movie_reviews (name, movie_name, movie_review)
      VALUES (${name}, ${movieName}, ${movieReview})
      RETURNING id, name, movie_name, movie_review, submitted_at
    `;
    
    console.log('Successfully saved review to database:', newReview.id);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Movie review submitted successfully!',
      data: {
        id: newReview.id,
        name: newReview.name,
        movieName: newReview.movie_name,
        movieReview: newReview.movie_review,
        submittedAt: new Date(newReview.submitted_at).toLocaleDateString()
      }
    });
    
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: error.message
    });
  }
} 