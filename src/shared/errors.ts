export class KeystoneError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'KeystoneError'
  }
}

export class ProjectNotFoundError extends KeystoneError {
  constructor(path: string) {
    super(`Project not found at: ${path}`, 'PROJECT_NOT_FOUND')
  }
}

export class DocumentNotFoundError extends KeystoneError {
  constructor(id: string) {
    super(`Document not found: ${id}`, 'DOCUMENT_NOT_FOUND')
  }
}

export class ProviderError extends KeystoneError {
  constructor(provider: string, message: string) {
    super(`${provider}: ${message}`, 'PROVIDER_ERROR')
  }
}

export class QuotaExhaustedError extends KeystoneError {
  constructor(provider: string) {
    super(`${provider} quota exhausted`, 'QUOTA_EXHAUSTED')
  }
}
