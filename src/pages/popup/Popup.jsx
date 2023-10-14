import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

import List from './List';
import Add from './Add';

import './Popup.scss';

const Popup = ({runtime}) => {

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className="App">
                <div className="Body">
                    <List
                        host={runtime.host}
                        config={runtime.config}
                        isSource={runtime.isCookieSource}
                        isTarget={runtime.isCookieTarget}
                        sources={runtime.sources}
                        targets={runtime.targets}
                        removeRule={(rule) => runtime.removeRule(rule)}
                    />
                </div>
                <div className="Footer">
                    <Add
                        host={runtime.host}
                        config={runtime.config}
                        targets={runtime.targets}
                        addRule={(rule) => runtime.addRule(rule)}
                    />
                </div>
            </div>
        </ThemeProvider>
    );
};

export default Popup;
