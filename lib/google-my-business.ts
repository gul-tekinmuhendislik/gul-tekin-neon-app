import { google } from 'googleapis';

const mybusiness = google.mybusinessbusinessinformation('v1');

export class GoogleMyBusinessAPI {
  private auth: any;

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
      ],
    });
  }

  async getAccountId() {
    const authClient = await this.auth.getClient();
    google.options({ auth: authClient });

    const mybusinessaccountmanagement = google.mybusinessaccountmanagement('v1');
    const response = await mybusinessaccountmanagement.accounts.list();

    if (response.data.accounts && response.data.accounts.length > 0) {
      return response.data.accounts[0].name;
    }

    throw new Error('No Google My Business account found');
  }

  async getBusinessInfo() {
    try {
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      const accountId = await this.getAccountId();

      const response = await mybusiness.accounts.locations.list({
        parent: accountId,
      });

      if (response.data.locations && response.data.locations.length > 0) {
        return response.data.locations[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching business info:', error);
      throw error;
    }
  }

  async getReviews() {
    try {
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      const accountId = await this.getAccountId();
      const mybusinessreviews = google.mybusiness('v4');

      const locationsResponse = await mybusinessreviews.accounts.locations.list({
        parent: accountId,
      });

      if (locationsResponse.data.locations && locationsResponse.data.locations.length > 0) {
        const locationName = locationsResponse.data.locations[0].name;

        const reviewsResponse = await mybusinessreviews.accounts.locations.reviews.list({
          parent: locationName,
        });

        return reviewsResponse.data.reviews || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async updateBusinessHours(hours: any) {
    try {
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      const accountId = await this.getAccountId();

      const locationsResponse = await mybusiness.accounts.locations.list({
        parent: accountId,
      });

      if (locationsResponse.data.locations && locationsResponse.data.locations.length > 0) {
        const locationName = locationsResponse.data.locations[0].name;

        const response = await mybusiness.locations.patch({
          name: locationName,
          updateMask: 'regularHours',
          requestBody: {
            regularHours: hours,
          },
        });

        return response.data;
      }

      throw new Error('No location found to update');
    } catch (error) {
      console.error('Error updating business hours:', error);
      throw error;
    }
  }

  async postUpdate(content: string, mediaUrl?: string) {
    try {
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      const accountId = await this.getAccountId();
      const mybusinessposts = google.mybusiness('v4');

      const locationsResponse = await mybusinessposts.accounts.locations.list({
        parent: accountId,
      });

      if (locationsResponse.data.locations && locationsResponse.data.locations.length > 0) {
        const locationName = locationsResponse.data.locations[0].name;

        const postData: any = {
          languageCode: 'tr',
          summary: content,
          topicType: 'STANDARD',
        };

        if (mediaUrl) {
          postData.media = [{
            mediaFormat: 'PHOTO',
            sourceUrl: mediaUrl,
          }];
        }

        const response = await mybusinessposts.accounts.locations.localPosts.create({
          parent: locationName,
          requestBody: postData,
        });

        return response.data;
      }

      throw new Error('No location found to post update');
    } catch (error) {
      console.error('Error posting update:', error);
      throw error;
    }
  }

  async getInsights(startDate: string, endDate: string) {
    try {
      const authClient = await this.auth.getClient();
      google.options({ auth: authClient });

      const accountId = await this.getAccountId();
      const mybusinessinsights = google.mybusiness('v4');

      const locationsResponse = await mybusinessinsights.accounts.locations.list({
        parent: accountId,
      });

      if (locationsResponse.data.locations && locationsResponse.data.locations.length > 0) {
        const locationName = locationsResponse.data.locations[0].name;

        const response = await mybusinessinsights.accounts.locations.reportInsights({
          name: locationName,
          requestBody: {
            locationNames: [locationName],
            basicRequest: {
              metricRequests: [
                { metric: 'ALL' },
              ],
              timeRange: {
                startTime: `${startDate}T00:00:00Z`,
                endTime: `${endDate}T23:59:59Z`,
              },
            },
          },
        });

        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }
}

export const gmb = new GoogleMyBusinessAPI();