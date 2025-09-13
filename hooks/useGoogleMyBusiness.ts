'use client';

import { useState, useEffect } from 'react';

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  website: string;
  regularHours: any;
  categories: string[];
}

interface Review {
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: string;
  comment?: string;
  createTime: string;
  updateTime: string;
}

export function useGoogleMyBusiness() {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google-my-business?action=info');
      const data = await response.json();

      if (data.success) {
        setBusinessInfo(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch business information');
      console.error('Error fetching business info:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google-my-business?action=reviews');
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/google-my-business?action=insights';
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setInsights(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch insights');
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessHours = async (hours: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google-my-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateHours',
          hours,
        }),
      });
      const data = await response.json();

      if (data.success) {
        await fetchBusinessInfo();
        return data.data;
      } else {
        setError(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      setError('Failed to update business hours');
      console.error('Error updating business hours:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const postUpdate = async (content: string, mediaUrl?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/google-my-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'post',
          content,
          mediaUrl,
        }),
      });
      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        setError(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      setError('Failed to post update');
      console.error('Error posting update:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_GMB === 'true') {
      fetchBusinessInfo();
      fetchReviews();
    }
  }, []);

  return {
    businessInfo,
    reviews,
    insights,
    loading,
    error,
    fetchBusinessInfo,
    fetchReviews,
    fetchInsights,
    updateBusinessHours,
    postUpdate,
  };
}