export const APP_NAME = 'Keystone'
export const APP_VERSION = '0.1.0'

export const DOCUMENT_TYPES = ['prd', 'tdd', 'adr'] as const

export const MAX_MESSAGES_IN_CONTEXT = 50
export const MAX_DOCUMENT_SIZE_BYTES = 1024 * 1024 // 1MB

export const DEFAULT_PROVIDER = 'anthropic' as const

export const ADR_TEMPLATE = `# ADR-{number}: {title}

## Status
Proposed

## Context
{context}

## Decision
{decision}

## Consequences
{consequences}

## Related
- Thread: {threadLink}
`
