export const inngest = {
  createFunction: jest.fn((config: any, trigger: any, handler: any) => {
    return {
      id: config.id,
      name: config.name,
      trigger,
      handler: jest.fn(handler)
    };
  }),
  send: jest.fn().mockResolvedValue({ ids: ['mock-event-id'] })
};

export const mockStep = {
  run: jest.fn((name: string, fn: () => any) => {
    return fn();
  }),
  sleep: jest.fn((name: string, duration: string) => {
    return Promise.resolve();
  }),
  sendEvent: jest.fn().mockResolvedValue({ id: 'mock-event-id' })
};

export const mockEvent = {
  data: {},
  name: 'test-event',
  id: 'test-event-id',
  ts: Date.now()
};