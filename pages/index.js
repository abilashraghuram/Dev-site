import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
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
          <form name="movie-review" method="POST" data-netlify="true">
            <input type="hidden" name="form-name" value="movie-review" />
            
            <p>
              <label>
                Your Name: 
                <input type="text" name="name" required />
              </label>
            </p>
            
            <p>
              <label>
                Movie Name: 
                <input type="text" name="movie-name" required />
              </label>
            </p>
            
            <p>
              <label>
                Movie Review: 
                <textarea name="movie-review" rows="5" required></textarea>
              </label>
            </p>
            
            <p>
              <button type="submit">Submit Review</button>
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
