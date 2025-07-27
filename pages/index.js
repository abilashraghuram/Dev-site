import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useState } from 'react'

export default function Home() {
  const [formStatus, setFormStatus] = useState('') // 'submitting', 'success', 'error', or ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormStatus('submitting')

    const form = event.target
    const formData = new FormData(form)

    try {
      await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      
      setFormStatus('success')
      form.reset() // Clear the form
      
      // Reset success message after 5 seconds
      setTimeout(() => setFormStatus(''), 5000)
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
        <Header title="Welcome to my app!" />
        <p className="description">
          Get started by editing <code>pages/index.js</code>
        </p>
        
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
      </main>

      <Footer />
    </div>
  )
}
