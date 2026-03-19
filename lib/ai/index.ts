import type { EngineProvider } from "./engine-provider"
import { simpleEngine } from "./simple-engine"

export type EngineProviderId = "simple"

const providers: Record<EngineProviderId, EngineProvider> = {
  simple: simpleEngine,
}

let activeProviderId: EngineProviderId = "simple"

export function setActiveEngineProvider(providerId: EngineProviderId) {
  activeProviderId = providerId
}

export function getActiveEngineProvider() {
  return providers[activeProviderId]
}

export function getEngineProvider(providerId: EngineProviderId) {
  return providers[providerId]
}

export function listEngineProviders() {
  return Object.values(providers).map((provider) => ({
    id: provider.id,
    label: provider.label,
  }))
}

