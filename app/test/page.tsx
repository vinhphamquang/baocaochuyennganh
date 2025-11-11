'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('API URL:', API_URL)
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'Test User Frontend',
          email: `test${Date.now()}@example.com`,
          password: '123456'
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      setResult(JSON.stringify(data, null, 2))
    } catch (error: any) {
      console.error('Error:', error)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Test API Connection</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Register API'}
        </button>

        {result && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}</p>
          <p>Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  )
}