// Mock implementations for external services

// Mock Exa API
export class MockExa {
  constructor() {}
  
  async searchAndContents() {
    return {
      results: [
        {
          id: 'mock-result-1',
          title: 'Mock Search Result 1',
          url: 'https://example.com/result1',
          text: 'This is mock content for testing purposes. It contains information about the search query.',
          score: 0.95,
          publishedDate: '2024-01-15',
          author: 'Test Author',
          highlights: ['mock highlight 1', 'mock highlight 2'],
          summary: 'Mock summary of the content'
        },
        {
          id: 'mock-result-2',
          title: 'Mock Search Result 2',
          url: 'https://example.com/result2',
          text: 'Another mock content piece with different information.',
          score: 0.88,
          publishedDate: '2024-01-10',
          author: null,
          highlights: ['mock highlight 3'],
          summary: 'Another mock summary'
        }
      ]
    }
  }
  
  async search() {
    return this.searchAndContents()
  }
}

// Mock Groq SDK
export class MockGroq {
  chat = {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: `# Mock Generated Content

## Introduction
This is mock generated content for testing purposes.

### Topic Overview
Mock content about the requested topic with all necessary sections.

**SEO Başlığı:** Mock SEO Title - Test Content
**Meta Açıklama:** This is a mock meta description for testing purposes
**Anahtar Kelimeler:** test, mock, content, generation, ai, testing`
          }
        }]
      })
    }
  }
  
  constructor() {}
}

// Mock Inngest
export class MockInngest {
  createFunction = jest.fn((config, trigger, handler) => {
    return jest.fn(handler)
  })
  
  send = jest.fn().mockResolvedValue({
    ids: ['mock-event-id']
  })
  
  constructor() {}
}

// Mock Resend
export class MockResend {
  emails = {
    send: jest.fn().mockResolvedValue({
      id: 'mock-email-id',
      from: 'test@example.com',
      to: ['recipient@example.com'],
      created_at: new Date().toISOString()
    })
  }
  
  constructor() {}
}