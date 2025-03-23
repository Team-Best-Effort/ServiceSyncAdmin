// theme.ts
"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#00c4cc", // Your specified primary color (teal/cyan)
        },
        secondary: {
          main: "#000000", // Your specified secondary color (black)
        },
        background: {
          default: "#ffffff",
          paper: "#f5f5f5",
        },
        text: {
          primary: "#333333",
          secondary: "#666666",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#00c4cc", // Same primary color for consistency
        },
        secondary: {
          main: "#000000", // Same secondary color for consistency
        },
        background: {
          default: "#1a1a1a",
          paper: "#242424",
        },
        text: {
          primary: "#ffffff",
          secondary: "#b3b3b3",
        },
      },
    },
  },

  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },

  components: {
    
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          visibility: "hidden",
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        h4: {
          display: "none", // Hides page title (if it's an <h4>)
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
          width: "100%",
          textTransform: "none",
          fontSize: "1rem", // Fixed typo from 'fontsize' to 'fontSize'
          borderRadius: "8px",
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        disableEscapeKeyDown: true,
      },
      styleOverrides: {
        paper: {
          borderRadius: "8px",
          textTransform: "none",
          boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgb(255, 255, 255)",
          overflow: "hidden",
        },
        paperWidthSm: {
          maxWidth: "400px",
        },
        paperWidthMd: {
          maxWidth: "600px",
        },
        paperWidthLg: {
          maxWidth: "800px",
        },
      },
    },
  },
});

export default theme;