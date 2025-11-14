export async function saveToDatabase(info) {
  // In production on Vercel, use relative URL. In dev, use VITE_API_URL or localhost
  const API_URL = import.meta.env.VITE_API_URL ||
                  (import.meta.env.PROD ? '' : 'http://localhost:3001')

  try {
    const response = await fetch(`${API_URL}/api/visitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(info),
    })

    if (!response.ok) {
      console.error('Failed to save to database:', await response.text())
      return false
    }

    const result = await response.json()
    console.log('Saved to database with ID:', result.id)
    return true
  } catch (error) {
    console.error('Error saving to database:', error)
    return false
  }
}
