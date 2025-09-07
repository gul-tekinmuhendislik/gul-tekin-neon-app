/**
 * @jest-environment node
 */
import { POST, GET } from '../route'
import { generateAndSaveContent, engineeringTopics } from '@/lib/content-generator'
import { sql } from '@/lib/db'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/content-generator', () => ({
  generateAndSaveContent: jest.fn(),
  engineeringTopics: [
    'Isı Pompası Sistemleri',
    'Güneş Enerjisi Sistemleri',
    'Su Depoları ve Hidrofor Sistemleri',
    'Yerden Isıtma Sistemleri',
    'Su Arıtma Sistemleri',
    'Klima Sistemleri',
    'Sulama Sistemleri',
    'Termosifonik Sistemler'
  ]
}))

jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

describe('API Route: /api/generate-content', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/generate-content', () => {
    it('should generate content for valid topic', async () => {
      const mockResult = {
        success: true,
        contentId: 'generated-id',
        topic: 'Isı Pompası Sistemleri',
        createdAt: new Date().toISOString()
      }
      
      ;(generateAndSaveContent as jest.Mock).mockResolvedValue(mockResult)

      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Isı Pompası Sistemleri' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(generateAndSaveContent).toHaveBeenCalledWith('Isı Pompası Sistemleri')
    })

    it('should return 400 for invalid topic', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Invalid Topic' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid topic',
        availableTopics: engineeringTopics
      })
      expect(generateAndSaveContent).not.toHaveBeenCalled()
    })

    it('should return 400 for missing topic', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid topic')
      expect(data.availableTopics).toEqual(engineeringTopics)
    })

    it('should handle generation errors', async () => {
      ;(generateAndSaveContent as jest.Mock).mockRejectedValue(
        new Error('Generation failed')
      )

      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Isı Pompası Sistemleri' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: 'Generation failed'
      })
    })

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })

    it('should process all valid engineering topics', async () => {
      ;(generateAndSaveContent as jest.Mock).mockResolvedValue({
        success: true,
        contentId: 'test-id',
        topic: 'test',
        createdAt: new Date().toISOString()
      })

      for (const topic of engineeringTopics) {
        const request = new NextRequest('http://localhost:3000/api/generate-content', {
          method: 'POST',
          body: JSON.stringify({ topic })
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(generateAndSaveContent).toHaveBeenCalledWith(topic)
      }
    })
  })

  describe('GET /api/generate-content', () => {
    it('should return latest content and available topics', async () => {
      const mockContent = [
        {
          id: 'content-1',
          topic: 'Isı Pompası Sistemleri',
          title: 'Test Title 1',
          meta_description: 'Test description 1',
          keywords: ['keyword1', 'keyword2'],
          status: 'draft',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'content-2',
          topic: 'Güneş Enerjisi Sistemleri',
          title: 'Test Title 2',
          meta_description: 'Test description 2',
          keywords: ['keyword3', 'keyword4'],
          status: 'published',
          created_at: '2024-01-02T00:00:00Z'
        }
      ]

      ;(sql as jest.Mock).mockResolvedValue(mockContent)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        availableTopics: engineeringTopics,
        latestContent: mockContent
      })
      expect(sql).toHaveBeenCalled()
    })

    it('should handle empty content list', async () => {
      ;(sql as jest.Mock).mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        availableTopics: engineeringTopics,
        latestContent: []
      })
    })

    it('should handle database errors', async () => {
      ;(sql as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        success: false,
        error: 'Database error'
      })
    })

    it('should limit results to 10 items', async () => {
      // Verify SQL query includes LIMIT 10
      ;(sql as jest.Mock).mockResolvedValue([])
      
      await GET()
      
      const sqlCall = (sql as jest.Mock).mock.calls[0]
      const queryString = sqlCall[0].join(' ')
      expect(queryString).toContain('LIMIT 10')
    })

    it('should order results by created_at DESC', async () => {
      ;(sql as jest.Mock).mockResolvedValue([])
      
      await GET()
      
      const sqlCall = (sql as jest.Mock).mock.calls[0]
      const queryString = sqlCall[0].join(' ')
      expect(queryString).toContain('ORDER BY created_at DESC')
    })
  })

  describe('Error Handling', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      ;(generateAndSaveContent as jest.Mock).mockRejectedValue('String error')

      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Isı Pompası Sistemleri' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('String error')
    })

    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')
      
      ;(generateAndSaveContent as jest.Mock).mockRejectedValue(error)

      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'Isı Pompası Sistemleri' })
      })

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith('Error generating content:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('Input Validation', () => {
    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: ''
      })

      const response = await POST(request)
      expect(response.status).toBe(500)
    })

    it('should handle null topic', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: null })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid topic')
    })

    it('should handle whitespace-only topic', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: '   ' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid topic')
    })

    it('should handle case-sensitive topic matching', async () => {
      const request = new NextRequest('http://localhost:3000/api/generate-content', {
        method: 'POST',
        body: JSON.stringify({ topic: 'ısı pompası sistemleri' }) // lowercase
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid topic')
      expect(data.availableTopics).toContain('Isı Pompası Sistemleri')
    })
  })
})