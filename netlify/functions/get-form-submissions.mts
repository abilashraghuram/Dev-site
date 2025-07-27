import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the site ID from environment variables or Netlify context
    const siteId = process.env.NETLIFY_SITE_ID || context.site?.id;
    const accessToken = process.env.NETLIFY_ACCESS_TOKEN;
    
    console.log('Environment check:', {
      siteId: siteId ? 'Found' : 'Missing',
      accessToken: accessToken ? 'Found' : 'Missing',
      contextSiteId: context.site?.id ? 'Found' : 'Missing'
    });
    
    if (!siteId) {
      console.error('Site ID not found in environment or context');
      return new Response(JSON.stringify({ 
        error: 'Site ID not found',
        debug: {
          envSiteId: !!process.env.NETLIFY_SITE_ID,
          contextSiteId: !!context.site?.id
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!accessToken) {
      console.error('Access token not found in environment');
      return new Response(JSON.stringify({ 
        error: 'Access token not configured. Please set NETLIFY_ACCESS_TOKEN environment variable.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiUrl = `https://api.netlify.com/api/v1/sites/${siteId}/forms/movie-review/submissions`;
    console.log('Making API request to:', apiUrl);

    // Fetch form submissions from Netlify API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        // Form not found - likely no submissions yet or form doesn't exist
        console.log('Form not found, checking all forms on site...');
        
        try {
          // Try to list all forms to see what's available
          const formsListResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (formsListResponse.ok) {
            const allForms = await formsListResponse.json();
            console.log('Available forms:', allForms.map((f: any) => f.name));
            
            return new Response(JSON.stringify({
              message: 'No submissions found yet',
              info: 'The movie-review form will appear here after the first submission.',
              availableForms: allForms.map((f: any) => ({ name: f.name, submissions: f.submission_count })),
              submissions: []
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (formsError) {
          console.error('Error fetching forms list:', formsError);
        }
        
        // If we can't get the forms list, just return an empty state
        return new Response(JSON.stringify({
          message: 'No submissions found yet',
          info: 'The movie-review form will appear here after the first submission.',
          submissions: []
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Other errors
      const errorText = await response.text();
      console.error('Netlify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return new Response(JSON.stringify({ 
        error: `Netlify API error: ${response.status} ${response.statusText}`,
        details: errorText
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const submissions = await response.json();
    console.log('Successfully fetched submissions:', submissions.length, 'items');
    
    // Transform the data to match our frontend expectations
    const transformedSubmissions = submissions.map((submission: any) => ({
      id: submission.id,
      name: submission.data?.name || 'Unknown',
      movieName: submission.data?.['movie-name'] || 'Unknown',
      movieReview: submission.data?.['movie-review'] || 'No review provided',
      submittedAt: new Date(submission.created_at).toLocaleDateString()
    }));

    return new Response(JSON.stringify(transformedSubmissions), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error fetching form submissions:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/form-submissions"
}; 