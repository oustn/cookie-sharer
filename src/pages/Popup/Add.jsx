import React from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Container from "@mui/material/Container";
import Fingerprint from "@mui/icons-material/Fingerprint";
import RocketLaunch from "@mui/icons-material/RocketLaunch";
import Cancel from '@mui/icons-material/Cancel';
import {ConfigHook} from "../../common/config-hook";
import {HostHook} from "../../common/host-hook";

export default function Add() {
    const [config, updateConfig] = ConfigHook()
    const [target, setTarget] = React.useState('');
    const [error, setError] = React.useState('');

    const host = HostHook()

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (event) => {
        setError('')
        setTarget('')
        setAnchorEl(event.currentTarget);
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
            const rules = config.rules || {}
            const rule = [...(rules[host] || [])]
            if (rule.includes(t)) {
                setError('共享地址已存在')
                return
            }
            rule.push(t)
            updateConfig({
                ...config,
                rules: {
                    ...rules,
                    [host]: [...new Set(rule)]
                }
            })

            handleClose()
        } catch (e) {
            setError('请输入合法的地址')
        }
    }

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <React.Fragment>
            <Button
                aria-describedby={id}
                variant="contained"
                color="success"
                disabled={!host}
                endIcon={<Fingerprint />}
                onClick={handleOpen}
            >
                新增
            </Button>
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
                        pb: 2
                    }}
                >
                    <Typography variant="caption" display="block" sx={{ mb: 2 }} >新增共享规则</Typography>

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
                        />
                    </Container>

                    <Container
                        sx={{
                            textAlign: 'right'
                        }}
                    >
                        <Button
                            variant="outlined"
                            endIcon={<Cancel />}
                            onClick={handleClose}
                            sx={{
                                mr: 2
                            }}
                        >
                            关闭
                        </Button>
                        <Button
                            variant="contained"
                            endIcon={<RocketLaunch />}
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
