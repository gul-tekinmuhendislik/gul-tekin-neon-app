export const getFacebookPageAccessToken = jest.fn().mockResolvedValue({
  accessToken: 'mock-access-token',
  pageId: 'mock-page-id'
});

export const postToFacebookPage = jest.fn().mockResolvedValue({
  id: 'mock-facebook-post-id'
});

export const extractOGData = jest.fn().mockReturnValue({
  title: 'Mock Title',
  description: 'Mock Description',
  link: 'https://example.com/mock-link'
});

export const saveFacebookPost = jest.fn().mockResolvedValue({
  id: 'mock-saved-post-id'
});