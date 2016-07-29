'use strict'

import React from 'react'
import { render } from 'react-dom'

import App from './views/app'

let appNode = document.createElement('div')
appNode.id = 'app'
appNode.className = 'window'
document.body.appendChild(appNode)

render(<App />, appNode)
