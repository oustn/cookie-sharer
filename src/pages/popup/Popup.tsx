import React from 'react'
import {observer} from "mobx-react-lite"
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import createTheme from '@mui/material/styles/createTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Runtime} from "@src/core";

import List from './List';
import Add from './Add';

import './Popup.scss';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface PopupProps {
    runtime: Runtime
}

const Popup = ({runtime}: PopupProps) => {

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

    const [notificationOpen, setOpen] = React.useState(false);

    const handleNotificationOpen = () => {
        setOpen(true);
    };

    const handleNotificationClose = (_: unknown, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <div className="App">
                <div className="Body">
                    <List
                        host={runtime.host}
                        isSource={runtime.isCookieSource}
                        isTarget={runtime.isCookieTarget}
                        sources={runtime.sources}
                        targets={runtime.targets}
                        removeRule={(rule) => runtime.removeRule(rule)}
                        handleSuccess={handleNotificationOpen}
                        handleActive={(rule: string) => runtime.handleActive(rule)}
                    />
                </div>
                {
                    !runtime.isCookieTarget && <div className="Footer">
                    <Add
                        host={runtime.host}
                        targets={runtime.targets}
                        addRule={(rule) => runtime.addRule({
                          host: rule,
                          activated: false
                        })}
                    />
                    </div>
                }
            </div>
            <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'center'}} open={notificationOpen}
                      autoHideDuration={2000} onClose={handleNotificationClose}>
                <Alert onClose={handleNotificationClose} severity="success" sx={{width: '100%'}}>
                    复制成功!
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default Popup;


export const PopupView = observer(Popup)
