
  "use client";
  import { createTheme } from '@mui/material/styles';

  const theme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    
    colorSchemes: { light: true, dark: true },
    components: {
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            visibility: 'hidden',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableRipple: true,
          disableElevation: true, 
        },
          styleOverrides: {
            root: {
              width: '100%',  
              textTransform: 'none',  
              fontsize: '1rem', 
              borderRadius: '8px',
            },
          },
        },
        MuiDialog: {
          defaultProps: {
            disableEscapeKeyDown: true,
          },
          styleOverrides: {
            paper: {
              borderRadius: '16px', // Slightly larger radius for a softer look
              textTransform: 'none',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.2)', // Deeper shadow for a more elevated feel
              background: 'linear-gradient(145deg,rgb(20, 16, 16),rgb(46, 46, 46))', // Subtle gradient for depth
              border: '1px solid rgba(0, 0, 0, 0.1)', // Light border for definition
              overflow: 'hidden', // Ensures child elements don't break the rounded corners
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', // Smooth transitions
              '&:hover': {
                transform: 'scale(1.02)', // Slight scale-up on hover for interactivity
                boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.25)', // Enhanced shadow on hover
              },
            },
            paperWidthSm: {
              maxWidth: '400px', // Custom width for small dialogs
            },
            paperWidthMd: {
              maxWidth: '600px', // Custom width for medium dialogs
            },
            paperWidthLg: {
              maxWidth: '800px', // Custom width for large dialogs
            },
          },
        },
      },
      
  });

  export default theme;
  