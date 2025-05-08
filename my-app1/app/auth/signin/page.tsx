"use client";
import * as React from 'react';
import { SignInPage } from '@toolpad/core/SignInPage';
import { providerMap } from '../../../auth';
import signIn from './actions';
import { AppProvider } from '@toolpad/core/AppProvider';
import theme from '@/theme';
import { Box, Alert, Typography } from '@mui/material';

const BRANDING = {
  title: 'ServiceSync',
};

function DemoInfo() {
  return (
    <Alert
    severity="info"
    sx={{
      boxShadow: '0 1px 12px #00c4cc',
      marginTop: '1rem',
      borderRadius: '6px',
      color: '#00c4cc',
      '& .MuiAlert-icon': {
        color: '#00c4cc',
      },
      width: '100%',
      maxWidth: '500px',
     
      justifyContent: 'center',
      alignItems: 'center',
      '& .MuiAlert-message': {
        textAlign: 'center',
        width: '100%',
      },
    }}
  >
    Please log in with your credentials
  </Alert>
  );
}

export default function SignIn() {
  return (
    <AppProvider branding={BRANDING} theme={theme}>
      <Box
        sx={{
          display: 'flex', // Flexbox for side-by-side layout
          flexDirection: 'row',
          height: '100vh', // Changed from minHeight to height
          width: '100%',
          overflow: 'hidden', // Prevent scrolling
        }}
      >
        {/* Left Side: Image (70%) with Title and Subtitle */}
        <Box
          sx={{
            flex: 0.65, // 65% of the width
            backgroundImage: 'url("https://i.imgur.com/6eOmZ60.gif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '100%', // Changed from minHeight to height
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '4rem',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '10%',
              color: '#ffffff',
              textShadow: '1px 1px 4px rgb(36, 35, 35)',
              textAlign: 'left',
              textDecorationStyle: 'double',
          
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
             <span style={{ color: '#CBCECD' }}>Welcome to Service</span><span style={{ color: '#00c4cc' }}>Sync</span>
            </Typography>
            <Typography
              variant="h6"
              color="#CBCECD"
              sx={{
                fontWeight: 'light',
              }}
            >
              Unify, Simplify, and Empower Your Business Operations
            </Typography>
          </Box>
        </Box>

        {/* Right Side: Form (30%) */}
        <Box
          sx={{
            flex: 0.45, // 45% of the width (adjusted to sum to 1 with 0.65)
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%', // Ensure it stays within parent height
            padding: '4rem',
          
          }}
        >

          <SignInPage
            signIn={signIn}
            providers={providerMap}
            slotProps={{ emailField: { autoFocus: false } }}
            slots={{ subtitle: DemoInfo, title: () => (
              <span style={{ fontWeight: 'bold', fontSize: '20px' }}>
                <span style={{ color: '#CBCECD' }}>Sign in to Service</span>
                <span style={{ color: '#00c4cc' }}>Sync</span>
              </span>
            ) }}
            sx={{
             
              '& form': {
                padding: '2rem',
                maxWidth: '800px',
                width: '100%',
           
              },
              '& form > .MuiStack-root': {
                rowGap: '1rem',
                alignItems: 'center',
              
              },
              '& .MuiButton-root': {
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                textTransform: 'none',
                backgroundColor: '#00c4cc',
                boxShadow: '0 1px 12px #00c4cc',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(0, 197, 204, 0.37)',
                },
              },
              '& .MuiTextField-root': {
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '3px',
                  '&:hover fieldset': {
                    borderColor: '#00c4cc',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00c4cc',
                  },
                },
              },
            }}
          />
        </Box>
      </Box>
    </AppProvider>
  );
}