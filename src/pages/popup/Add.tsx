import React from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Container from "@mui/material/Container";
import Fingerprint from "@mui/icons-material/Fingerprint";
import RocketLaunch from "@mui/icons-material/RocketLaunch";
import Cancel from '@mui/icons-material/Cancel';
import type {Target} from "@src/types";

interface AddProps {
    host: string
    addRule: (target: string) => void
    targets: Target[]
}

export default function Add({host, addRule, targets}: AddProps) {
    const [target, setTarget] = React.useState('');
    const [error, setError] = React.useState('');

    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

    const handleOpen: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setError('')
        setTarget('')
        setAnchorEl(event.currentTarget as Element);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSave = () => {
        if (!target) {
            setError('请输入需要共享 Cookie 的地址')
            return
        }
        let t = target
        if (!/^.*:\/\/.+/.test(target)) {
            t = `https://${target}`
        }
        try {
            const url = new URL(t)
            if (url.origin === host) {
                setError('不能共享相同的地址')
                return
            }
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                setError('只支持 http 和 https 协议')
                return
            }
            if (url.origin === target) {
                t = target
            } else if (/^https?:\/\/.+$/.test(target)) {
                t = url.origin
            } else {
                t = url.host
            }
            if (targets.find(target => target.host === t)) {
                setError('共享地址已存在')
                return
            }
            addRule(t)
            handleClose()
        } catch (e: unknown) {
            console.log(e)
            setError('保存失败')
        }
    }

    const handleSaveByEnter: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            event.stopPropagation()
            handleSave()
        }
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <React.Fragment>
            <Container>
                <Button
                    aria-describedby={id}
                    variant="contained"
                    color="success"
                    disabled={!host}
                    endIcon={<Fingerprint/>}
                    onClick={handleOpen}
                >
                    新增
                </Button>
            </Container>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
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
                    <Typography variant="caption" display="block" sx={{mb: 2}}>新增共享规则</Typography>

                    <Container
                        sx={{
                            height: 164,
                            pl: 0,
                            pr: 0
                        }}
                    >
                        <TextField
                            disabled
                            fullWidth
                            size="small"
                            id="filled-disabled"
                            label="Cookie Host"
                            defaultValue={host}
                            variant="standard"
                            sx={{
                                mb: 2
                            }}
                        />
                        <TextField
                            fullWidth
                            color="secondary"
                            size="small"
                            label="共享地址"
                            variant="standard"
                            error={!!error}
                            helperText={error || "请输入需要共享 Cookie 的地址，例如：https://www.baidu.com 或 localhost:1234 "}
                            sx={{
                                mb: 2
                            }}
                            value={target}
                            onChange={(event) => {
                                setTarget(event.target.value);
                            }}
                            onFocus={() => setError('')}
                            onKeyDown={handleSaveByEnter}
                        />
                    </Container>

                    <Container
                        sx={{
                            textAlign: 'right'
                        }}
                    >
                        <Button
                            variant="outlined"
                            endIcon={<Cancel/>}
                            onClick={handleClose}
                            sx={{
                                mr: 2
                            }}
                        >
                            关闭
                        </Button>
                        <Button
                            variant="contained"
                            endIcon={<RocketLaunch/>}
                            onClick={handleSave}
                        >
                            保存
                        </Button>
                    </Container>
                </Container>
            </Popover>
        </React.Fragment>
    )
}
