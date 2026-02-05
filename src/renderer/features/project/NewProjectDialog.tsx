import { useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

interface NewProjectDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string, path: string) => void
}

export function NewProjectDialog({ open, onClose, onCreate }: NewProjectDialogProps) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')

  const handleBrowse = async () => {
    const selected = await window.keystoneIPC.selectDirectory()
    if (selected) setPath(selected)
  }

  const handleCreate = () => {
    if (!name.trim() || !path.trim()) return
    onCreate(name.trim(), path.trim())
    setName('')
    setPath('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="New Project">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Project Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-project"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <div className="flex gap-2">
            <div className="flex h-9 min-w-0 flex-1 items-center overflow-hidden rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
              <span className="truncate">
                {path || 'Select a folder...'}
              </span>
            </div>
            <Button variant="secondary" onClick={handleBrowse}>
              Browse...
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || !path.trim()}>
            Create Project
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
