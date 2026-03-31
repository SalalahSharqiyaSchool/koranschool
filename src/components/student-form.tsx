"use client"

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addStudent, updateStudent } from '@/lib/storage'

interface StudentFormProps {
  open: boolean
  onClose: () => void
  group: string
  classId: string
  editingStudent?: {id: string, name: string} | null
  onSuccess: () => void
}

export default function StudentForm({ open, onClose, group, classId, editingStudent, onSuccess }: StudentFormProps) {
  const [name, setName] = React.useState(editingStudent?.name || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingStudent) {
      updateStudent(group, classId, editingStudent.id, name)
    } else {
      addStudent(group, classId, name)
    }

    setName('')
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد'}</DialogTitle>
          <DialogDescription>
            أدخل اسم الطالب في الفصل {classId}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student-name">اسم الطالب</Label>
            <Input
              id="student-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد أحمد"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="mr-auto">
              {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

