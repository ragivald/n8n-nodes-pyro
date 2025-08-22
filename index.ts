import type { INodeTypeDescription } from 'n8n-workflow'

import { Pyrogram } from './nodes/Pyro/Pyro.node'
import { PyroTrigger } from './nodes/PyroTrigger/PyroTrigger.node'
import { PyroApi } from './credentials/PyroApi.credentials'

export const nodes = [Pyrogram, PyroTrigger]
export const credentials = [PyroApi]

// Export for typing
export { Pyrogram, PyroTrigger, PyroApi }
