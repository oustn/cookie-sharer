import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import Switch from '@mui/material/Switch'
import empty from '@src/assets/empty.svg';
import {resolveUrls} from "@src/common";

import Cookie from './Cookie.tsx';
import type {Target} from "@src/types";

interface RuleListProps {
  host: string
  targets: Target[]
  sources: Target[]
  removeRule: (target: string) => void
  isSource: boolean
  isTarget: boolean
  handleSuccess: () => void
  handleActive: (target: string) => void
}

export default function RuleList({
                                   targets,
                                   removeRule,
                                   isTarget,
                                   sources,
                                   isSource,
                                   handleSuccess,
                                   handleActive
                                 }: RuleListProps) {
  if (!isTarget && !targets.length) {
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

  const header = isTarget ? 'Cookie 来自以下网站：' : '共享的网站列表：'

  const handleNewTab = async (url: string) => {
    chrome.tabs.create({url}).catch(e => {
      console.log(e)
    })
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
        sx={{width: '100%', bgcolor: 'background.paper'}}
        subheader={<ListSubheader>{header}</ListSubheader>}
      >
        {(isTarget ? sources : targets).map(item => {
          const target = item.host
          const active = item.activated

          return (
            <ListItem
              key={target}
              secondaryAction={[
                (<IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {
                    removeRule(target)
                  }}
                >
                  <DeleteIcon/>
                </IconButton>),
                isTarget && <Cookie
                    host={target}
                    handleSuccess={handleSuccess}
                />
              ]}
              sx={{
                pl: 0,
                pr: 0,
              }}
            >
              {
                <ListItemIcon>
                   <Switch
                     disabled={!isTarget}
                      edge="end"
                      onChange={() => handleActive(target)}
                      checked={active}
                      inputProps={{
                        'aria-labelledby': 'active-rule',
                      }}
                    />
                </ListItemIcon>
              }
              <ListItemText
                primary={target}
                title={target}
                secondary={isSource ? resolveUrls(target)?.map(d => (
                  <span
                    style={{display: 'block'}}
                    key={d}>{d}</span>)) : ''
                }
                sx={{
                  cursor: 'pointer',
                  pr: isTarget ? '24px' : 0,
                  span: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
                onClick={() => handleNewTab(target)}
              />
            </ListItem>
          )
        })}
      </List>
    </Container>
  )
}
