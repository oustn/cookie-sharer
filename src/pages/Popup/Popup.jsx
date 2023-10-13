import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

import List from './List';
import Add from './Add';
import {HostHook} from "../../common/host-hook";

import './Popup.scss';
import {ConfigHook} from "../../common/config-hook";

const Popup = () => {
    const host = HostHook()
    const [config, updateConfig] = ConfigHook()

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
                        host={host}
                        config={config}
                        updateConfig={updateConfig}
                    />
                </div>
                <div className="Footer">
                    <Add
                        host={host}
                        config={config}
                        updateConfig={updateConfig}
                    />
                </div>
            </div>
        </ThemeProvider>
    );
};

export default Popup;
