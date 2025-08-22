import type { INodeTypeDescription } from 'n8n-workflow'

import { Pyro } from './nodes/Pyro/Pyro.node'
import { PyroTrigger } from './nodes/PyroTrigger/PyroTrigger.node'
import { PyroApi } from './nodes/credentials/PyroApi.credentials'

export const nodes = [Pyro, PyroTrigger]
export const credentials = [PyroApi]

// Експорт для типізації
export { Pyro, PyroTrigger, PyroApi }