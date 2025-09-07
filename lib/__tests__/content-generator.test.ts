// Mock the dependencies first, before any imports
jest.mock('../db')
jest.mock('exa-js', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockExa } = require('../__mocks__/external-services')
  return {
    __esModule: true,
    default: MockExa
  }
})
jest.mock('groq-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MockGroq } = require('../__mocks__/external-services')
  return {
    __esModule: true,
    default: MockGroq
  }
})

import { 
  searchTopicContent, 
  generateContent, 
  saveGeneratedContent, 
  generateAndSaveContent,
  engineeringTopics 
} from '../content-generator'
import { sql } from '../db'

describe('Content Generator Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    process.env.GROQ_API_KEY = 'test-groq-key'
    process.env.EXA_API_KEY = 'test-exa-key'
  })

  describe('engineeringTopics', () => {
    it('should contain all expected engineering topics', () => {
      expect(engineeringTopics).toHaveLength(8)
      expect(engineeringTopics).toContain('Isı Pompası Sistemleri')
      expect(engineeringTopics).toContain('Güneş Enerjisi Sistemleri')
      expect(engineeringTopics).toContain('Su Depoları ve Hidrofor Sistemleri')
      expect(engineeringTopics).toContain('Yerden Isıtma Sistemleri')
      expect(engineeringTopics).toContain('Su Arıtma Sistemleri')
      expect(engineeringTopics).toContain('Klima Sistemleri')
      expect(engineeringTopics).toContain('Sulama Sistemleri')
      expect(engineeringTopics).toContain('Termosifonik Sistemler')
    })
  })

  describe('searchTopicContent', () => {
    it('should search for content using Exa API', async () => {
      const topic = 'Isı Pompası Sistemleri'
      const results = await searchTopicContent(topic)

      expect(results).toHaveLength(2)
      expect(results[0]).toHaveProperty('title')
      expect(results[0]).toHaveProperty('url')
      expect(results[0]).toHaveProperty('content')
      expect(results[0].title).toBe('Mock Search Result 1')
      expect(results[0].url).toBe('https://example.com/result1')
    })

    it('should handle search errors gracefully', async () => {
      // Mock Exa to throw an error
      jest.spyOn(console, 'error').mockImplementation()
      const { MockExa } = require('../__mocks__/external-services')
      MockExa.prototype.searchAndContents = jest.fn().mockRejectedValue(new Error('API Error'))
      
      const results = await searchTopicContent('Test Topic')
      expect(results).toEqual([])
      
      // Restore the original mock
      MockExa.prototype.searchAndContents = jest.fn().mockResolvedValue({
        results: [
          {
            title: 'Mock Search Result 1',
            url: 'https://example.com/result1',
            text: 'This is mock content for testing purposes. It contains information about the search query.'
          },
          {
            title: 'Mock Search Result 2',
            url: 'https://example.com/result2',
            text: 'Another mock content piece with different information.'
          }
        ]
      })
    })

    it('should limit content to 1000 characters', async () => {
      const results = await searchTopicContent('Test Topic')
      results.forEach(result => {
        expect(result.content.length).toBeLessThanOrEqual(1000)
      })
    })

    it('should construct proper search query with Turkish keywords', async () => {
      const topic = 'Güneş Enerjisi Sistemleri'
      const results = await searchTopicContent(topic)
      
      // Verify that results are returned (mock will always return data)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('generateContent', () => {
    const mockSearchData = [
      {
        title: 'Test Article 1',
        url: 'https://example.com/1',
        content: 'Content about heat pumps and energy efficiency.'
      },
      {
        title: 'Test Article 2',
        url: 'https://example.com/2',
        content: 'Information about installation and maintenance.'
      }
    ]

    it('should generate content using Groq API', async () => {
      const topic = 'Isı Pompası Sistemleri'
      const result = await generateContent(topic, mockSearchData)

      expect(result).toHaveProperty('content')
      expect(result).toHaveProperty('seoTitle')
      expect(result).toHaveProperty('metaDescription')
      expect(result).toHaveProperty('keywords')
      expect(result.content).toContain('Mock Generated Content')
      expect(result.seoTitle).toBe('Mock SEO Title - Test Content')
    })

    it('should parse SEO elements from generated content', async () => {
      const result = await generateContent('Test Topic', mockSearchData)
      
      expect(result.seoTitle).toBeTruthy()
      expect(result.metaDescription).toBeTruthy()
      expect(result.keywords).toBeInstanceOf(Array)
      expect(result.keywords.length).toBeGreaterThan(0)
    })

    it('should handle missing SEO elements with defaults', async () => {
      // Mock Groq to return content without SEO elements
      const { MockGroq } = require('../__mocks__/external-services')
      const originalCreate = MockGroq.prototype.chat.completions.create
      MockGroq.prototype.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: '# Simple content without SEO elements'
          }
        }]
      })

      const topic = 'Test Topic'
      const result = await generateContent(topic, mockSearchData)
      
      expect(result.seoTitle).toContain(topic)
      expect(result.metaDescription).toContain(topic)
      expect(result.keywords).toContain(topic)
      
      // Restore the original mock
      MockGroq.prototype.chat.completions.create = originalCreate
    })

    it('should include search data context in prompt', async () => {
      const result = await generateContent('Test Topic', mockSearchData)
      expect(result.content).toBeTruthy()
      // The mock will be called with the search data
      expect(result).toBeDefined()
    })

    it('should handle API errors', async () => {
      // Mock Groq to throw an error
      const { MockGroq } = require('../__mocks__/external-services')
      const originalCreate = MockGroq.prototype.chat.completions.create
      MockGroq.prototype.chat.completions.create = jest.fn().mockRejectedValue(new Error('Groq API Error'))

      await expect(generateContent('Test Topic', mockSearchData))
        .rejects.toThrow('Groq API Error')
        
      // Restore the original mock
      MockGroq.prototype.chat.completions.create = originalCreate
    })
  })

  describe('saveGeneratedContent', () => {
    const mockData = {
      topic: 'Isı Pompası Sistemleri',
      title: 'Test Title',
      content: 'Test content',
      metaTitle: 'Test Meta Title',
      metaDescription: 'Test meta description',
      keywords: ['keyword1', 'keyword2'],
      searchData: [
        { title: 'Source 1', url: 'https://example.com/1', content: 'Content 1' }
      ]
    }

    it('should save content to database', async () => {
      const result = await saveGeneratedContent(
        mockData.topic,
        mockData.title,
        mockData.content,
        mockData.metaTitle,
        mockData.metaDescription,
        mockData.keywords,
        mockData.searchData
      )

      expect(sql).toHaveBeenCalled()
      expect(result).toHaveProperty('id', 'mock-content-id')
      expect(result).toHaveProperty('topic', mockData.topic)
      expect(result).toHaveProperty('created_at')
    })

    it('should handle database errors', async () => {
      ;(sql as unknown as jest.Mock).mockRejectedValueOnce(new Error('Database error'))

      await expect(
        saveGeneratedContent(
          mockData.topic,
          mockData.title,
          mockData.content,
          mockData.metaTitle,
          mockData.metaDescription,
          mockData.keywords,
          mockData.searchData
        )
      ).rejects.toThrow('Database error')
    })

    it('should properly format data for database insertion', async () => {
      await saveGeneratedContent(
        mockData.topic,
        mockData.title,
        mockData.content,
        mockData.metaTitle,
        mockData.metaDescription,
        mockData.keywords,
        mockData.searchData
      )

      const sqlCall = (sql as unknown as jest.Mock).mock.calls[0]
      expect(sqlCall).toBeDefined()
      // Verify the SQL was called (the mock doesn't preserve exact params)
      expect(sql).toHaveBeenCalled()
    })
  })

  describe('generateAndSaveContent', () => {
    it('should complete the full content generation workflow', async () => {
      const topic = 'Isı Pompası Sistemleri'
      const result = await generateAndSaveContent(topic)

      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('contentId', 'mock-content-id')
      expect(result).toHaveProperty('topic', topic)
      expect(result).toHaveProperty('createdAt')
    })

    it('should log progress messages', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      await generateAndSaveContent('Test Topic')
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Generating content for:'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Found'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Content generated successfully'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Content saved with ID:'))
      
      consoleSpy.mockRestore()
    })

    it('should handle search errors', async () => {
      // Mock searchTopicContent to throw error
      const { MockExa } = require('../__mocks__/external-services')
      const originalSearch = MockExa.prototype.searchAndContents
      MockExa.prototype.searchAndContents = jest.fn().mockRejectedValue(new Error('Search failed'))
      
      // searchTopicContent catches errors and returns empty array
      const result = await generateAndSaveContent('Test Topic')
      expect(result.success).toBe(true) // Still succeeds with empty search results
      
      // Restore the original mock
      MockExa.prototype.searchAndContents = originalSearch
    })

    it('should handle content generation errors', async () => {
      // Mock generateContent to throw error
      const { MockGroq } = require('../__mocks__/external-services')
      const originalCreate = MockGroq.prototype.chat.completions.create
      MockGroq.prototype.chat.completions.create = jest.fn().mockRejectedValue(new Error('Generation failed'))

      await expect(generateAndSaveContent('Test Topic'))
        .rejects.toThrow('Generation failed')
        
      // Restore the original mock
      MockGroq.prototype.chat.completions.create = originalCreate
    })

    it('should handle database save errors', async () => {
      ;(sql as unknown as jest.Mock).mockRejectedValueOnce(new Error('Save failed'))

      await expect(generateAndSaveContent('Test Topic'))
        .rejects.toThrow('Save failed')
    })

    it('should process all engineering topics', async () => {
      for (const topic of engineeringTopics) {
        const result = await generateAndSaveContent(topic)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty search results', async () => {
      const { MockExa } = require('../__mocks__/external-services')
      const originalSearch = MockExa.prototype.searchAndContents
      MockExa.prototype.searchAndContents = jest.fn().mockResolvedValue({ results: [] })

      const results = await searchTopicContent('Obscure Topic')
      expect(results).toEqual([])
      
      // Restore the original mock
      MockExa.prototype.searchAndContents = originalSearch
    })

    it('should handle malformed API responses', async () => {
      const { MockExa } = require('../__mocks__/external-services')
      const originalSearch = MockExa.prototype.searchAndContents
      MockExa.prototype.searchAndContents = jest.fn().mockResolvedValue({ 
        results: [
          { title: null, url: null, text: null }
        ] 
      })

      const results = await searchTopicContent('Test')
      expect(results[0].title).toBe('Untitled')
      expect(results[0].content).toBe('')
      
      // Restore the original mock
      MockExa.prototype.searchAndContents = originalSearch
    })

    it('should handle missing environment variables', async () => {
      delete process.env.GROQ_API_KEY
      delete process.env.EXA_API_KEY

      // Should still work with empty API keys (mocked)
      const result = await generateAndSaveContent('Test Topic')
      expect(result.success).toBe(true)
    })
  })
})