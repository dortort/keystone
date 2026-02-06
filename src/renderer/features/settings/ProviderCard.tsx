import { Button } from '../../components/ui/Button'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ProviderType } from '@shared/types'
import { OAUTH_CAPABILITIES } from '@shared/constants'

interface ProviderCardProps {
  type: ProviderType
  name: string
  isActive: boolean
  onSelect: () => void
}

export function ProviderCard({ type, name, isActive, onSelect }: ProviderCardProps) {
  const { oauthStatus, oauthFlowStatus, startOAuthFlow, disconnectOAuth } = useSettingsStore()

  const oauth = oauthStatus[type]
  const capabilities = OAUTH_CAPABILITIES[type]
  const isOAuthSupported = capabilities?.supported ?? false
  const isExperimental = capabilities?.experimental ?? false
  const isPending = oauthFlowStatus.state === 'pending' && 'provider' in oauthFlowStatus && oauthFlowStatus.provider === type
  const isError = oauthFlowStatus.state === 'error' && 'provider' in oauthFlowStatus && oauthFlowStatus.provider === type

  const handleSignIn = async () => {
    await startOAuthFlow(type)
  }

  const handleDisconnect = async () => {
    await disconnectOAuth(type)
  }

  return (
    <div
      className={`rounded-lg border p-4 transition-colors cursor-pointer ${
        isActive
          ? 'border-indigo-500 bg-indigo-500/5'
          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <input
          type="radio"
          name="provider"
          id={`provider-${type}`}
          checked={isActive}
          onChange={onSelect}
          className="text-indigo-600"
          aria-label={`Select ${name} as AI provider`}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <label htmlFor={`provider-${type}`} className="text-sm font-medium cursor-pointer">{name}</label>
            {isExperimental && (
              <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                Experimental
              </span>
            )}
          </div>
        </div>
      </div>

      {/* OAuth section */}
      {isOAuthSupported && (
        <div className="mt-3 ml-7">
          {oauth.connected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1.5 dark:bg-green-900/20">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-green-700 dark:text-green-400">
                  Connected{oauth.email ? ` as ${oauth.email}` : ''}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDisconnect()
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="Disconnect"
                aria-label={`Disconnect ${name}`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSignIn()
                }}
                disabled={isPending}
              >
                {isPending ? 'Waiting for browser...' : `Sign in with ${name.split(' ')[0]}`}
              </Button>
              {isError && 'error' in oauthFlowStatus && (
                <p className="mt-1 text-xs text-red-500">{oauthFlowStatus.error}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* API key only notice for Anthropic */}
      {!isOAuthSupported && type === 'anthropic' && (
        <div className="mt-2 ml-7">
          <span className="text-xs text-gray-400">API key required (no OAuth available)</span>
        </div>
      )}
    </div>
  )
}
