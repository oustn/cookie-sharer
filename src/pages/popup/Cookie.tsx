import React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Container from "@mui/material/Container";
import CookieIcon from "@mui/icons-material/Cookie";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Tooltip from "@mui/material/Tooltip";

import {CookieHook} from '@src/common'

interface CookieProps {
    host: string
    handleSuccess: () => void
}

export default function Cookie({host, handleSuccess}: CookieProps) {
    const cookies = CookieHook(host)

    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

    const handleOpen: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setAnchorEl(event.currentTarget as Element);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const id = open ? 'simple-popover' : undefined;

    const handleCopy = (cookie: string) => {
        navigator.clipboard.writeText(cookie).then(() => {
            console.log('copy success')
            handleSuccess()
        }).catch(e => {
            console.log(e)
        })
    }

    return (
        <React.Fragment>
            <IconButton
                aria-describedby={id}
                edge="end"
                aria-label="delete"
                onClick={handleOpen}
                disabled={!cookies.length}
            >
                <CookieIcon
                    color={cookies.length ? "success" : "disabled"}
                />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Container
                    sx={{
                        pt: 2,
                        pb: 2,
                        width: '328px'
                    }}
                >
                    <Typography variant="caption" display="block" sx={{mb: 2}}>Cookie 明细</Typography>

                    <Container
                        sx={{
                            height: 200,
                            pl: 0,
                            pr: 0
                        }}
                    >
                        <List
                            dense
                        >
                            {cookies.map(cookie => (
                                <ListItem
                                    key={cookie.name}
                                    sx={{
                                        padding: 0,
                                    }}
                                >
                                    <Tooltip title={"复制 Cookie"}>
                                        <ListItemButton
                                            sx={{
                                                padding: 1,
                                            }}
                                            onClick={() => handleCopy(cookie.value)}
                                        >
                                            <ListItemText
                                                primary={cookie.name}
                                                secondary={cookie.value}
                                                sx={{
                                                    '& .MuiListItemText-secondary': {
                                                        wordBreak: 'break-all',
                                                        lineBreak: 'anywhere',
                                                    },
                                                }}
                                            />
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            ))}
                        </List>
                    </Container>
                </Container>
            </Popover>
        </React.Fragment>
    )
}
