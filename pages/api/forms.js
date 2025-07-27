// Next.js API route for handling form submissions in development mode
// This provides a fallback when Netlify Forms aren't available

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In development mode, we can't actually save the form data
    // But we can simulate a successful submission
    const { name, 'movie-name': movieName, 'movie-review': movieReview } = req.body;
    
    console.log('Form submission received (dev mode):', {
      name,
      movieName,
      movieReview,
      timestamp: new Date().toISOString()
    });

    // Simulate successful submission
    res.status(200).json({
      success: true,
      message: 'Form submitted successfully (development mode)',
      data: { name, movieName, movieReview }
    });
    
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 