
import React, { useState } from 'react'
import jobData from './jobs.json'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'

export default function App() {
  const [matches, setMatches] = useState([])

  const handleUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    let text = ""
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(" ") + " "
      }
    } else {
      text = await file.text()
    }

    const keywords = extractKeywords(text)

    const ranked = jobData.map(job => {
      const jobKeywords = extractKeywords(job.description)
      const matchScore = keywords.filter(k => jobKeywords.includes(k)).length
      return { ...job, matchScore }
    }).filter(job => job.matchScore > 2).sort((a, b) => b.matchScore - a.matchScore)

    setMatches(ranked.slice(0, 5))
  }

  const extractKeywords = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: 'auto' }}>
      <h1>Welcome, Public Servant</h1>
      <p>Upload your resume to discover California state job openings that match your mission and experience.</p>
      <input type="file" accept=".pdf,.txt" onChange={handleUpload} />
      <h2>Top Matches:</h2>
      <ul>
        {matches.map((job, i) => (
          <li key={i} style={{ marginBottom: '1rem' }}>
            <strong>{job.title}</strong> — {job.department} <br/>
            <small>{job.description.slice(0, 100)}...</small><br/>
            <em>Match Score: {job.matchScore}</em>
          </li>
        ))}
      </ul>
    </div>
  )
}
