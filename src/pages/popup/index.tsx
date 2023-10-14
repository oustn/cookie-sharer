import React from 'react'
import ReactDOM from 'react-dom/client'
import {Runtime} from '@src/core'


import { PopupView } from './Popup.tsx'

import './index.scss';

const runtime = Runtime.getInstance()

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <PopupView runtime={runtime}/>
    </React.StrictMode>,
)
