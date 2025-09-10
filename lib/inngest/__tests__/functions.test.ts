// Import shim first
import 'groq-sdk/shims/node';

// Mock all dependencies before importing functions
jest.mock('../../db');
jest.mock('../../content-generator');
jest.mock('../../eeat-optimizer');
jest.mock('../client');
jest.mock('groq-sdk');
jest.mock('../../facebook-api');
jest.mock('exa-js');

// Now import the functions
import { generateEngineeringContent, processNewContent, applyEEATOptimizations } from '../functions';
import { sql } from '../../db';
import { generateAndSaveContent } from '../../content-generator';
import { optimizeContentForEEAT, generateSchemaMarkup, analyzeEEAT } from '../../eeat-optimizer';
import { inngest } from '../client';
import Groq from 'groq-sdk';

const mockStep = {
  run: jest.fn((name: string, fn: () => any) => fn()),
  sleep: jest.fn().mockResolvedValue(undefined),
  sendEvent: jest.fn().mockResolvedValue({ id: 'mock-event-id' })
};

const mockInngest = inngest as jest.Mocked<typeof inngest>;

describe('Inngest Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.EXA_API_KEY = 'test-exa-key';
  });

  describe('generateEngineeringContent', () => {
    const mockContentResult = {
      contentId: 'test-content-123',
      createdAt: '2025-01-10T10:00:00Z',
      topic: 'Isı Pompası Sistemleri',
      title: 'Test Content Title'
    };

    beforeEach(() => {
      (generateAndSaveContent as jest.Mock).mockResolvedValue(mockContentResult);
      mockInngest.send.mockResolvedValue({ ids: ['event-123'] });
    });

    it('should generate new content when no existing content for topic today', async () => {
      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT id, topic, created_at')) {
          return Promise.resolve([]);
        }
        if (query.includes('INSERT INTO event_logs')) {
          return Promise.resolve([{ id: 'log-123' }]);
        }
        return Promise.resolve([]);
      });

      const handler = generateEngineeringContent.handler || generateEngineeringContent;
      const result = await handler({ step: mockStep } as any);

      expect(mockStep.run).toHaveBeenCalledWith('check-existing-content', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('generate-content', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('trigger-content-created-event', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('log-content-generation', expect.any(Function));

      expect(generateAndSaveContent).toHaveBeenCalled();
      expect(mockInngest.send).toHaveBeenCalledWith({
        name: 'content/created',
        data: {
          contentId: mockContentResult.contentId,
          topic: expect.any(String),
          createdAt: mockContentResult.createdAt
        }
      });

      expect(result).toMatchObject({
        success: true,
        contentId: mockContentResult.contentId,
        createdAt: mockContentResult.createdAt
      });
    });

    it('should skip generation when content already exists for topic today', async () => {
      const existingContent = {
        id: 'existing-123',
        topic: 'Isı Pompası Sistemleri',
        created_at: new Date().toISOString()
      };

      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT id, topic, created_at')) {
          return Promise.resolve([existingContent]);
        }
        return Promise.resolve([]);
      });

      const handler = generateEngineeringContent.handler || generateEngineeringContent;
      const result = await handler({ step: mockStep } as any);

      expect(mockStep.run).toHaveBeenCalledWith('check-existing-content', expect.any(Function));
      expect(generateAndSaveContent).not.toHaveBeenCalled();
      expect(mockInngest.send).not.toHaveBeenCalled();

      expect(result).toMatchObject({
        success: true,
        message: 'Content already generated today',
        existingContentId: existingContent.id
      });
    });

    it('should handle content generation errors gracefully', async () => {
      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT id, topic, created_at')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const error = new Error('Generation failed');
      (generateAndSaveContent as jest.Mock).mockRejectedValue(error);

      const handler = generateEngineeringContent.handler || generateEngineeringContent;
      
      await expect(handler({ step: mockStep } as any)).rejects.toThrow('Content generation failed: Generation failed');
    });
  });

  describe('processNewContent', () => {
    const mockContent = {
      id: 'content-123',
      topic: 'Isı Pompası Sistemleri',
      title: 'Test Title',
      slug: 'test-slug',
      meta_title: 'Test Meta Title',
      meta_description: 'Test meta description',
      keywords: ['test', 'keywords'],
      content: 'Test content body',
      status: 'published',
      created_at: '2025-01-10T10:00:00Z'
    };

    const mockEEATResult = {
      analysis: {
        experience: { score: 20, indicators: [], recommendations: [] },
        expertise: { score: 22, indicators: [], recommendations: [] },
        authoritativeness: { score: 18, indicators: [], recommendations: [] },
        trustworthiness: { score: 20, indicators: [], recommendations: [] },
        overallScore: 80,
        ymylCategory: false,
        contentImprovements: [],
        schemaMarkupSuggestions: []
      },
      optimizationApplied: false
    };

    beforeEach(() => {
      (optimizeContentForEEAT as jest.Mock).mockResolvedValue(mockEEATResult);
      (generateSchemaMarkup as jest.Mock).mockReturnValue({
        '@context': 'https://schema.org',
        '@type': 'Article'
      });
      mockInngest.send.mockResolvedValue({ ids: ['event-456'] });
    });

    it('should process new content successfully', async () => {
      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([mockContent]);
        }
        if (query.includes('SELECT id, title, slug, topic') && query.includes('related')) {
          return Promise.resolve([
            { id: 'related-1', title: 'Related 1', slug: 'related-1', topic: 'Same Topic' }
          ]);
        }
        return Promise.resolve([{ id: 'result-123' }]);
      });

      const event = {
        data: { contentId: 'content-123' }
      };

      const handler = processNewContent.handler || processNewContent;
      const result = await handler({ event, step: mockStep } as any);

      expect(mockStep.run).toHaveBeenCalledWith('fetch-content-details', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('update-sitemap', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('generate-social-meta', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('eeat-analysis-optimization', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('generate-schema-markup', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('analyze-seo-quality', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('schedule-distribution', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('find-related-content', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('trigger-eeat-optimization', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('log-processing-complete', expect.any(Function));

      expect(optimizeContentForEEAT).toHaveBeenCalledWith(
        mockContent.id,
        mockContent.content,
        mockContent.topic,
        expect.any(Object)
      );

      expect(generateSchemaMarkup).toHaveBeenCalled();

      expect(result).toMatchObject({
        success: true,
        contentId: mockContent.id,
        slug: mockContent.slug,
        eeatScore: mockEEATResult.analysis.overallScore,
        schemaMarkupGenerated: true
      });
    });

    it('should trigger E-E-A-T optimization when score is below 75', async () => {
      const lowScoreEEATResult = {
        ...mockEEATResult,
        analysis: {
          ...mockEEATResult.analysis,
          overallScore: 65
        }
      };

      (optimizeContentForEEAT as jest.Mock).mockResolvedValue(lowScoreEEATResult);

      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([mockContent]);
        }
        return Promise.resolve([]);
      });

      const event = {
        data: { contentId: 'content-123' }
      };

      const handler = processNewContent.handler || processNewContent;
      await handler({ event, step: mockStep } as any);

      expect(mockInngest.send).toHaveBeenCalledWith({
        name: 'content/optimize.eeat',
        data: {
          contentId: mockContent.id,
          eeatAnalysis: lowScoreEEATResult.analysis,
          forceOptimization: false
        }
      });
    });

    it('should handle missing content gracefully', async () => {
      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const event = {
        data: { contentId: 'non-existent' }
      };

      const handler = processNewContent.handler || processNewContent;
      
      await expect(handler({ event, step: mockStep } as any)).rejects.toThrow('Content not found with ID: non-existent');
    });
  });

  describe('applyEEATOptimizations', () => {
    const mockContent = {
      id: 'content-123',
      topic: 'Isı Pompası Sistemleri',
      title: 'Test Title',
      content: 'Original content',
      slug: 'test-slug',
      meta_title: 'Meta Title',
      meta_description: 'Meta Description',
      keywords: ['test'],
      metadata: {}
    };

    const mockEEATAnalysis = {
      experience: { score: 15 },
      expertise: { score: 18 },
      authoritativeness: { score: 16 },
      trustworthiness: { score: 17 },
      overallScore: 66,
      contentImprovements: ['Improvement 1', 'Improvement 2']
    };

    const mockGroqClient = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };

    beforeEach(() => {
      (Groq as jest.MockedClass<typeof Groq>).mockImplementation(() => mockGroqClient as any);
      (analyzeEEAT as jest.Mock).mockResolvedValue({
        ...mockEEATAnalysis,
        overallScore: 85
      });
    });

    it('should optimize content when E-E-A-T score is below 75', async () => {
      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([mockContent]);
        }
        if (query.includes('UPDATE generated_content')) {
          return Promise.resolve([{ id: mockContent.id, slug: mockContent.slug, updated_at: new Date() }]);
        }
        return Promise.resolve([]);
      });

      mockGroqClient.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: 'Optimized content with E-E-A-T improvements' }
        }]
      });

      const event = {
        data: {
          contentId: 'content-123',
          eeatAnalysis: mockEEATAnalysis,
          forceOptimization: false
        }
      };

      const handler = applyEEATOptimizations.handler || applyEEATOptimizations;
      const result = await handler({ event, step: mockStep } as any);

      expect(mockStep.run).toHaveBeenCalledWith('fetch-content-for-optimization', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('check-optimization-needed', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('generate-optimized-content', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('update-content-in-database', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('reanalyze-eeat-score', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('log-optimization', expect.any(Function));

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mixtral-8x7b-32768',
          temperature: 0.4,
          max_tokens: 3500
        })
      );

      expect(result).toMatchObject({
        success: true,
        contentId: mockContent.id,
        slug: mockContent.slug,
        optimizationApplied: true,
        scores: {
          original: mockEEATAnalysis.overallScore,
          new: 85,
          improvement: 19
        }
      });
    });

    it('should skip optimization when content already has good E-E-A-T score', async () => {
      const highScoreContent = {
        ...mockContent,
        metadata: {
          eeatAnalysis: { overallScore: 82 }
        }
      };

      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([highScoreContent]);
        }
        return Promise.resolve([]);
      });

      const event = {
        data: {
          contentId: 'content-123',
          eeatAnalysis: { overallScore: 82 },
          forceOptimization: false
        }
      };

      const handler = applyEEATOptimizations.handler || applyEEATOptimizations;
      const result = await handler({ event, step: mockStep } as any);

      expect(mockGroqClient.chat.completions.create).not.toHaveBeenCalled();
      
      expect(result).toMatchObject({
        success: true,
        message: 'Optimization not needed',
        contentId: 'content-123',
        currentScore: 82
      });
    });

    it('should force optimization when forceOptimization is true', async () => {
      const optimizedContent = {
        ...mockContent,
        metadata: {
          eeatOptimized: true,
          eeatAnalysis: { overallScore: 85 }
        }
      };

      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([optimizedContent]);
        }
        if (query.includes('UPDATE generated_content')) {
          return Promise.resolve([{ id: mockContent.id, slug: mockContent.slug, updated_at: new Date() }]);
        }
        return Promise.resolve([]);
      });

      mockGroqClient.chat.completions.create.mockResolvedValue({
        choices: [{
          message: { content: 'Re-optimized content' }
        }]
      });

      const event = {
        data: {
          contentId: 'content-123',
          eeatAnalysis: { overallScore: 85 },
          forceOptimization: true
        }
      };

      const handler = applyEEATOptimizations.handler || applyEEATOptimizations;
      const result = await handler({ event, step: mockStep } as any);

      expect(mockGroqClient.chat.completions.create).toHaveBeenCalled();
      expect(result.optimizationApplied).toBe(true);
    });

    it('should handle Groq API errors gracefully', async () => {
      const mockSql = sql as jest.MockedFunction<typeof sql>;
      mockSql.mockImplementation((strings, ...values) => {
        const query = strings[0];
        if (query.includes('SELECT') && query.includes('FROM generated_content')) {
          return Promise.resolve([mockContent]);
        }
        return Promise.resolve([]);
      });

      mockGroqClient.chat.completions.create.mockRejectedValue(new Error('Groq API error'));

      const event = {
        data: {
          contentId: 'content-123',
          eeatAnalysis: mockEEATAnalysis,
          forceOptimization: false
        }
      };

      const handler = applyEEATOptimizations.handler || applyEEATOptimizations;
      
      await expect(handler({ event, step: mockStep } as any)).rejects.toThrow('Groq API error');
    });
  });
});