import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

interface PageProps {
  children: React.ReactNode;
}

const Page = ({ children }: PageProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
        spacing: 4,
        components: {
          MuiButton: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiFilledInput: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiFormControl: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiFormHelperText: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiIconButton: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiInputBase: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiInputLabel: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiListItem: {
            defaultProps: {
              dense: true,
            },
          },
          MuiOutlinedInput: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiFab: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiTable: {
            defaultProps: {
              size: 'small',
            },
          },
          MuiTextField: {
            defaultProps: {
              margin: 'dense',
            },
          },
          MuiToolbar: {
            defaultProps: {
              variant: 'dense',
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default Page;
