"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/provider"

interface TextEditDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  title: string
  defaultValue: string
  onSave: (text: string) => void
  /** 多行输入（主标题用），允许换行 */
  multiline?: boolean
  /** 输入框下方的说明文字 */
  hint?: string
}

export function TextEditDialog({
  isOpen,
  onOpenChange,
  title,
  defaultValue,
  onSave,
  multiline = false,
  hint,
}: TextEditDialogProps) {
  const { t } = useI18n();
  const [text, setText] = useState(defaultValue)

  // 当对话框打开或默认值变化时更新文本
  useEffect(() => {
    setText(defaultValue)
  }, [defaultValue, isOpen])

  const handleSave = () => {
    onSave(text)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {multiline ? (
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[88px] resize-y"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSave()
                }
              }}
            />
          ) : (
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave()
                }
              }}
            />
          )}
          {hint && (
            <p className="mt-2 text-xs leading-relaxed text-gray-500 whitespace-pre-line">
              {hint}
            </p>
          )}
        </div>
        <DialogFooter className="flex flex-row justify-between gap-2 sm:justify-end sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 sm:flex-none"
          >
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
