import type { INodeTypeDescription } from 'n8n-workflow'

import { Pyro } from './nodes/Pyro/Pyro.node'
import { PyroApi } from './nodes/credentials/PyroApi.credentials'

export const nodes = [Pyro]
export const credentials = [PyroApi]

// Експорт для типізації
export { Pyro, PyroApi }