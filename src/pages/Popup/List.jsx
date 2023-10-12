import React from 'react'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import {ConfigHook} from '../../common/config-hook'
import {HostHook} from '../../common/host-hook'
import empty from '../../assets/img/empty';

export default function RuleList() {
    const [config] = ConfigHook()
    const host = HostHook()

    if (!config || !config.rules || !Object.keys(config.rules).length || !Object.values(config.rules).some(d => d.length)) {
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
    const rules = Object.entries(config.rules).sort((a, b) =>
        a[0] === host ? -Infinity : a[0] - b[0])

    return (
        <Container
            sx={{
                background: '#f1f4f8',
                pt: 2,
                pb: 2
            }}
        >
            {rules.map(([source, targets]) => Array.isArray(targets) && targets.length ? <Box key={source}>
                <List
                    sx={{ width: '100%', bgcolor: 'background.paper' }}
                    subheader={<ListSubheader>{source}</ListSubheader>}
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
                            <ListItemText
                                primary={target}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box> : null)}
        </Container>
    )
}
