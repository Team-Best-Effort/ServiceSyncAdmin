"use client";

import * as React from 'react';
import { useState, useEffect, FormEvent } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { ref, update, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from './lib/firebase';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Loader from '../Loader';
import theme from '@/theme';

interface UserData {
  name: string;
  image: string;
  email: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  border: '1px solid #404040',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid #ffffff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  transition: 'transform 0.3s ease-in-out',
  backgroundColor: '#404040',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 4),
  textTransform: 'none',
  fontWeight: 600,
  backgroundColor: '#ffffff',
  color: '#000000',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  '&:hover': {
    backgroundColor: '#f0f0f0',
    boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
  },
  '&:disabled': {
    backgroundColor: '#666666',
    color: '#999999',
  },
}));

export default function EditProfilePage() {
  const { data: session } = useSession() as { data: Session | null };
  const [userData, setUserData] = useState<UserData>({
    name: '',
    image: '',
    email: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [showWarning, setShowWarning] = useState<boolean>(false);



  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || '',
        image: session.user.image || '',
        email: session.user.email || '',
      });
      setLoading(false);

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [session]);

  // Display loader while loading
  if (isLoading) {
    return <Loader size={60} color={theme.palette.primary.main} />; // Use theme primary color for loader
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const authRef = ref(db, 'Authentication');
      const authQuery = query(
        authRef,
        orderByChild('email'),
        equalTo(session.user.email)
      );

      const snapshot = await get(authQuery);
      if (snapshot.exists()) {
        const userKey = Object.keys(snapshot.val())[0];
        const userRef = ref(db, `Authentication/${userKey}`);

        await update(userRef, {
          name: userData.name,
          image: userData.image,
          email: userData.email,
        });

        setSuccess(true);
        setShowWarning(true);

      } else {
        throw new Error('User not found in database');
      }
    } catch (err) {
      console.warn('Profile update failed. Please check your connection and try again.');
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', my: 6 }}>
      <StyledPaper elevation={3}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <StyledAvatar
              src={userData.image}
              alt={userData.name}
            >
              {!userData.image && userData.name.charAt(0).toUpperCase()}
            </StyledAvatar>
          </Box>

          <TextField fullWidth label="Name" name="name" value={userData.name} onChange={handleChange} margin="normal" required variant="outlined" />
          <TextField fullWidth label="Profile Image URL" name="image" value={userData.image} onChange={handleChange} margin="normal" variant="outlined" helperText="Enter a valid image URL" />
          <TextField fullWidth label="Email" name="email" value={userData.email} onChange={handleChange} margin="normal" required variant="outlined" />

          {error && <Alert severity="error">⚠️ {error}</Alert>}
          {success && <Alert severity="success">Profile updated successfully! Please logout and login if you changed your email!</Alert>}
          {showWarning && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              ⚠️ If you updated the email, please also manually update them in Firebase Authentication. Changes here do not sync with Firebase Auth.
            </Alert>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <StyledButton type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
              {loading ? 'Saving...' : 'Save Changes'}
            </StyledButton>
          </Box>
        </Box>
      </StyledPaper>
    </Box>
  );
}
