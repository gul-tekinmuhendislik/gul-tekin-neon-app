// Mock database module for testing
export const sql = jest.fn().mockImplementation((strings: TemplateStringsArray, ...values: unknown[]) => {
  // Mock implementation for database queries
  const query = strings.join('?')
  
  // Default mock responses for different queries
  if (query.includes('INSERT INTO event_logs')) {
    return Promise.resolve([{
      id: 'mock-event-id',
      event_name: values[0] || 'test-event',
      created_at: new Date().toISOString()
    }])
  }
  
  if (query.includes('UPDATE event_logs')) {
    return Promise.resolve([{
      id: 'mock-event-id',
      status: 'completed',
      processed_at: new Date().toISOString()
    }])
  }
  
  if (query.includes('INSERT INTO search_results')) {
    return Promise.resolve([{
      id: 'mock-search-id',
      search_query: values[0] || 'test-query',
      created_at: new Date().toISOString()
    }])
  }
  
  if (query.includes('SELECT id FROM search_results')) {
    return Promise.resolve([]) // No duplicates by default
  }
  
  if (query.includes('DELETE FROM search_results')) {
    return Promise.resolve([{ id: 'deleted-1' }, { id: 'deleted-2' }])
  }
  
  if (query.includes('INSERT INTO generated_content')) {
    return Promise.resolve([{
      id: 'mock-content-id',
      topic: values[0],
      created_at: new Date().toISOString()
    }])
  }
  
  if (query.includes('SELECT id, topic, created_at FROM generated_content')) {
    return Promise.resolve([]) // No existing content by default
  }
  
  if (query.includes('SELECT') && query.includes('FROM generated_content')) {
    return Promise.resolve([
      {
        id: 'content-1',
        topic: 'Test Topic 1',
        title: 'Test Title 1',
        meta_description: 'Test description',
        keywords: ['keyword1', 'keyword2'],
        status: 'draft',
        created_at: new Date().toISOString()
      }
    ])
  }
  
  // Default empty result for unknown queries
  return Promise.resolve([])
})

// Export mock pool for connection testing
export const pool = {
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn()
  }),
  end: jest.fn().mockResolvedValue(undefined)
}