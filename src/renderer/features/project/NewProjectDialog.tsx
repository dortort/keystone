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
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/Users/you/projects"
          />
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
