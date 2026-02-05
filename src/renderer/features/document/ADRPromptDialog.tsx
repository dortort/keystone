import { Dialog } from '../../components/ui/Dialog'

interface ADRPromptDialogProps {
  open: boolean
  previousDecision: string
  newDecision: string
  onCreateADR: () => void
  onDismiss: () => void
}

export function ADRPromptDialog({
  open,
  previousDecision,
  newDecision,
  onCreateADR,
  onDismiss,
}: ADRPromptDialogProps) {
  return (
    <Dialog open={open} onClose={onDismiss} title="Decision Change Detected">
      <div className="space-y-4">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p className="mb-2">A pivot in the decision-making process has been detected:</p>
          <div className="rounded-md bg-gray-100 p-3 dark:bg-gray-700">
            <p className="font-medium">From:</p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{previousDecision}</p>
            <p className="mt-3 font-medium">To:</p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{newDecision}</p>
          </div>
          <p className="mt-3">Would you like to create an ADR to document this decision?</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onDismiss}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Dismiss
          </button>
          <button
            onClick={onCreateADR}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create ADR
          </button>
        </div>
      </div>
    </Dialog>
  )
}
