'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Button, Typography, CircularProgress, Box } from '@mui/material';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { PageHeader, PageHeaderToolbar } from '@toolpad/core/PageContainer';

interface CompanyInfo {
  CompanyName?: string;
  [key: string]: any; // Allow additional properties for flexibility
}

const PayrollPage: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track OAuth status
  const pageHeaderToolbar = {
    title: 'Payrolls',
    breadcrumbs: [
      { title: 'Dashboard', path: '/' },
      { title: 'Payroll', path: '/payroll' },
    ],
  };
  // Fetch company info from backend with proper typing and error handling
  const fetchCompanyInfo = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response: AxiosResponse<CompanyInfo | { error: string }> = await axios.get(
        'http://localhost:3001/quickbooks/company-info',
        {
          withCredentials: true, // If using cookies for token persistence
        }
      );
      if ('error' in response.data) {
        if (response.data.error === 'No valid token or realmId found. Please authenticate first.') {
          setError('Please connect to QuickBooks to access company info.');
          setIsAuthenticated(false);
        } else {
          throw new Error(response.data.error);
        }
      } else {
        setCompanyInfo(response.data);
        setIsAuthenticated(true);
      }
    } catch (err: AxiosError | any) {
      let errorMessage = 'Failed to fetch company info';
      if (axios.isAxiosError(err)) {
        if (err.response) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.request) {
          errorMessage = "Network error. Check your internet connection.";
        } else {
          errorMessage = "Unexpected error. Please refresh and try again.";
        }
      } else {
        errorMessage = err.message || errorMessage;
      }
      console.warn('Error fetching company info:');
      setError(errorMessage);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch company info if we’ve already authenticated or want to check status
    if (isAuthenticated) {
      fetchCompanyInfo();
    }
  }, [isAuthenticated, fetchCompanyInfo]);

  const handleConnectQuickBooks = () => {
    // Redirect to backend OAuth flow
    window.location.href = 'http://localhost:3001/quickbooks/auth';
  };

  // Check authentication status on page load
  const checkAuthenticationStatus = useCallback(() => {
    fetchCompanyInfo(); // Initially check if we’re authenticated
  }, [fetchCompanyInfo]);

  useEffect(() => {
    checkAuthenticationStatus();
  }, [checkAuthenticationStatus]);

  return (
    <Box sx={{ padding: '1rem' }}>

      {loading && <CircularProgress />}

      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}

      {!companyInfo && !error && !loading && !isAuthenticated && (
        <Box>
          <Typography variant="body1">
            You are not connected to QuickBooks.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleConnectQuickBooks}>
            Connect to QuickBooks
          </Button>
        </Box>
      )}

      {companyInfo && (
        <Box>
          <Typography variant="h6">Company Info:</Typography>
          <Typography variant="body1">
            Company Name: {companyInfo.CompanyName || 'N/A'}
          </Typography>
          <pre style={{ maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(companyInfo, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default PayrollPage;