// Note: This is the theme file that contains the theme configuration for the app.
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
          main: "#00c4cc",
        },
        secondary: {
          main: "#000000",
        },
        background: {
          default: "#ffffff",
          paper: "#f8f9fa",
        },
        text: {
          primary: "#1a1a1a",
          secondary: "#4a4a4a",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#00c4cc",
        },
        secondary: {
          main: "#000000",
        },
        background: {
          default: "#0d0d0d",
          paper: "#181818",
        },
        text: {
          primary: "#e0e0e0",
          secondary: "#a0a0a0",
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
          display: "none",
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
          fontSize: "1rem",
          borderRadius: "0",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, var(--mui-palette-background-paper) 0%, rgba(0, 196, 204, 0.05) 100%)",
          borderRight: "none",
          width: 220,
          boxShadow: "2px 0 20px #00c4cc",
          overflow: "hidden",
          overflowY: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          '[data-toolpad-color-scheme="dark"] &': {
            background: "linear-gradient(180deg, #181818 0%, rgba(0, 196, 204, 0.15) 100%)",
            boxShadow: "1px 0 10px #00c4cc",
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 1,
          position: "relative",
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 1,
          height: 50,
          margin: 1,
          color: "var(--mui-palette-text-primary)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          boxSizing: "border-box",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "10%",
            width: "80%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #00c4cc, transparent)",
            opacity: 0,
            transform: "scaleX(0)",
            transition: "opacity 0.2s ease, transform 0.3s ease",
          },
          "&:hover": {
            backgroundColor: "transparent",
            color: "#00c4cc",
            "&:before": {
              opacity: 1,
              transform: "scaleX(1)",
            },
          },
          "&.Mui-selected": {
            background: "linear-gradient(90deg, #00c4cc 0%, #008b91 100%)",
            color: "#ffffff",
            borderRadius: "8px",
            margin: "0 8px",
            boxShadow: "0 0 15px rgba(0, 196, 204, 0.5), 0 0 25px rgba(0, 196, 204, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
            border: "1px solid",
            borderImage: "linear-gradient(90deg, #00c4cc, #00e6f0) 1",
            transform: "translateY(-2px)",
            "&:after": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              width: "4px",
              height: "100%",
              background: "linear-gradient(180deg, #00c4cc, #00e6f0)",
              boxShadow: "0 0 10px rgba(0, 196, 204, 0.7)",
            },
            "&:hover": {
              background: "linear-gradient(90deg, #00b3b8 0%, #007a82 100%)",
              boxShadow: "0 0 20px rgba(0, 196, 204, 0.7), 0 0 30px rgba(0, 196, 204, 0.4), 0 6px 12px rgba(0, 0, 0, 0.3)",
              transform: "translateY(-4px)",
            },
          },
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          fontSize: "0.9rem",
          fontWeight: 600,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          lineHeight: "40px",
          backgroundColor: "transparent",
          color: "#000000",
          padding: "0 16px",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          transition: "color 0.3s ease",
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          '[data-toolpad-color-scheme="dark"] &': {
            color: "#ffffff",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%)",
          display: "flex",
          '[data-toolpad-color-scheme="dark"] &': {
            background: "#0d0d0d",
            borderBottom: "1px solid transparent",
            borderImage: "linear-gradient(45deg, #585858, #00e6f0) 1",
            borderImageSlice: 1,
            '[data-toolpad-color-scheme="dark"] &': {
              background: "#0d0d0d",
            },
            '[data-toolpad-color-scheme="light"] &': {
              background: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.67) 100%)",
            },
          },
          '[data-toolpad-color-scheme="light"] &': {
            background: "linear-gradient(90deg, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.67) 100%)",
          },
          "& .MuiTypography-root, & [class*='appTitle'], & [class*='title']": {
            fontSize: "1.3rem",
            fontWeight: 600,
            letterSpacing: "0.5px",
            background: "#00c4cc",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "text-shadow 0.3s ease, transform 0.3s ease",
          },
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