import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useState, useEffect } from 'react'

export default function Home() {
  const [formStatus, setFormStatus] = useState('') // 'submitting', 'success', 'error', or ''
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch submissions from Netlify API
  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/form-submissions')
      
      // Check if response is ok and is JSON
      if (!response.ok) {
        // If it's a 404, the function doesn't exist (Next.js only mode)
        if (response.status === 404) {
          console.log('API endpoint not available (Next.js only mode)')
          setSubmissions([])
          setError('')
          return
        }
        
        // Handle 401 Unauthorized (missing Netlify credentials)
        if (response.status === 401) {
          console.log('Netlify API credentials not configured')
          setSubmissions([])
          setError('Netlify API access not configured. This feature works best when deployed.')
          return
        }
        
        // Try to parse as JSON, but handle if it's HTML
        let errorMessage = 'Failed to fetch submissions'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.log('Response is not JSON, likely HTML error page')
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        console.warn('API Error:', errorMessage)
        setSubmissions([])
        setError(`Unable to load submissions: ${errorMessage}`)
        return
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.log('Response is not JSON, API endpoint not available')
        setSubmissions([])
        setError('')
        return
      }
      
      const data = await response.json()
      
      // Handle the case where the function returns an object with submissions array
      if (Array.isArray(data)) {
        setSubmissions(data)
      } else if (data.submissions && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions)
      } else {
        setSubmissions([])
      }
      
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError('Unable to connect to the submissions API. This feature works best when deployed to Netlify.')
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  // Load submissions on component mount
  useEffect(() => {
    fetchSubmissions()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormStatus('submitting')

    const form = event.target
    const formData = new FormData(form)

    try {
      // Check if we're running in Netlify environment (has Functions)
      // or development mode (use Next.js API route)
      const isNetlifyEnvironment = window.location.hostname.includes('netlify') || 
                                  window.location.port === '8888'
      
      let response
      const formObject = Object.fromEntries(formData)
      
      if (isNetlifyEnvironment) {
        // Use Netlify Function with database
        response = await fetch('/api/submit-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formObject)
        })
      } else {
        // Use Next.js API route for development (also with database if available)
        response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formObject)
        })
      }
      
      if (response.ok) {
        const result = await response.json()
        console.log('Submission successful:', result)
        
        setFormStatus('success')
        form.reset() // Clear the form
        
        // Refresh submissions immediately to show the new submission
        setTimeout(() => {
          fetchSubmissions()
          setFormStatus('')
        }, 1000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
    } catch (error) {
      console.error('Form submission error:', error)
      setFormStatus('error')
      
      // Reset error message after 5 seconds
      setTimeout(() => setFormStatus(''), 5000)
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Review a Movie!!" />
        
        {/* Movie Review Form */}
        <div className="form-container">
          <h2>Movie Review Form</h2>
          
          {/* Status Messages */}
          {formStatus === 'success' && (
            <div className="status-message success">
              ✅ Thank you! Your movie review has been submitted successfully.
            </div>
          )}
          
          {formStatus === 'error' && (
            <div className="status-message error">
              ❌ There was an error submitting your review. Please try again.
            </div>
          )}
          
          <form name="movie-review" method="POST" onSubmit={handleSubmit}>
            <input type="hidden" name="form-name" value="movie-review" />
            
            <p>
              <label>
                Your Name: 
                <input type="text" name="name" required disabled={formStatus === 'submitting'} />
              </label>
            </p>
            
            <p>
              <label>
                Movie Name: 
                <input type="text" name="movie-name" required disabled={formStatus === 'submitting'} />
              </label>
            </p>
            
            <p>
              <label>
                Movie Review: 
                <textarea name="movie-review" rows="5" required disabled={formStatus === 'submitting'}></textarea>
              </label>
            </p>
            
            <p>
              <button type="submit" disabled={formStatus === 'submitting'}>
                {formStatus === 'submitting' ? 'Submitting...' : 'Submit Review'}
              </button>
            </p>
          </form>
        </div>

        {/* Submissions Table */}
        <div className="submissions-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Movie Reviews ({submissions.length})</h2>
            <button 
              onClick={fetchSubmissions} 
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {error && (
            <div className="status-message error">
              ❌ {error}
            </div>
          )}

          {loading && submissions.length === 0 ? (
            <div className="loading-message">
              Loading submissions...
            </div>
          ) : submissions.length > 0 ? (
            <div className="table-wrapper">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Movie Name</th>
                    <th>Movie Review</th>
                    <th>Date Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{submission.name}</td>
                      <td>{submission.movieName}</td>
                      <td className="review-cell">{submission.movieReview}</td>
                      <td>{submission.submittedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-message">
              {error ? 
                <div>
                  <p>Movie reviews will be stored in the Neon database once deployed to Netlify.</p>
                  <p style={{fontSize: '0.9em', color: '#666', marginTop: '0.5rem'}}>
                    <strong>Current status:</strong> {error}
                  </p>
                </div> :
                'No movie reviews submitted yet. Be the first to submit a review!'
              }
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
