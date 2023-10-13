import React from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import LaunchIcon from '@mui/icons-material/Launch'
import empty from '../../assets/img/empty';
import {resolveUrls} from "../../common/helper";

export default function RuleList({ host, config }) {

    /**
     * @type {string[]}
     */
    const targets = (config && config.rules && config.rules[host]) || []

    if (!targets.length) {
        return (
            <Container sx={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <img className="Empty" src={empty} alt="empty"/>
                <Typography variant="caption" display="block" sx={{mt: 2}}>请添加规则</Typography>
            </Container>
        )
    }

    return (
        <Container
            sx={{
                pt: 0,
                pb: 0,
                pl: 0,
                pr: 0,
            }}
        >
                <List
                    sx={{ width: '100%', bgcolor: 'background.paper' }}
                    subheader={<ListSubheader>{host} 共享的网站列表：</ListSubheader>}
                >
                    {targets.map(target => (
                        <ListItem
                            key={target}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete">
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemIcon>
                                <IconButton edge="end" aria-label="open">
                                    <LaunchIcon />
                                </IconButton>
                            </ListItemIcon>
                            <ListItemText
                                primary={target}
                                secondary={resolveUrls(target).map(d => (<div>{d}</div>))}
                            />
                        </ListItem>
                    ))}
                </List>
        </Container>
    )
}
