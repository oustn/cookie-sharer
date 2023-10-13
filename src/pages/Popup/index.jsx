import React from 'react';
import {createRoot} from 'react-dom/client';
import {observer} from "mobx-react-lite"

import Popup from './Popup';
import './index.css';
import {Runtime} from "../../state/runtime";

const runtime = new Runtime()

self.r = runtime

const PopupView = observer(Popup)

const container = document.getElementById('app-container');
const root = createRoot(container);
root.render(<PopupView runtime={runtime}/>);
