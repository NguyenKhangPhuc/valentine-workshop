'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { CollectionItem } from '../types/collection_item'
import { createMemory } from './tasks/task-3'
import { useNotification } from '../context/NotificationContext'
import { colorManagement } from './tasks/color-management'

interface CreateMemoryItemModalProps {
  isOpen: boolean
  onClose: () => void
  collectionId: string
  onSuccess: (item: CollectionItem) => void
}

interface FormInputs {
  name: string
  description: string
  memory_date: string
  order: number
}

export function CreateMemoryItemModal({
  isOpen,
  onClose,
  collectionId,
  onSuccess,
}: CreateMemoryItemModalProps) {
  const { showNotification } = useNotification()
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isCloseHovered, setIsCloseHovered] = useState(false)
  const [isCancelHovered, setIsCancelHovered] = useState(false)
  const [isSubmitHovered, setIsSubmitHovered] = useState(false)
  const [isDropzoneHovered, setIsDropzoneHovered] = useState(false)
  const [isDeleteHovered, setIsDeleteHovered] = useState(false)
  const dropzoneRef = useRef<HTMLLabelElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: { name: '', description: '', memory_date: '', order: 1 },
  })


  const processFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Only PNG, JPG, and WEBP image formats are supported.')
      return
    }
    const url = URL.createObjectURL(file)
    setSelectedUrl(url)
    setSelectedFile(file)
  }

  useEffect(() => {
    const el = dropzoneRef.current
    if (!el) return

    const stopNativeMouse = (e: Event) => { e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation() }
    const handleNativeDragOver = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'; setIsDragging(true) }
    const handleNativeDragLeave = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }
    const handleNativeDrop = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation(); setIsDragging(false)
      if (e.dataTransfer?.files?.length) processFile(e.dataTransfer.files[0])
    }

    el.addEventListener('mousedown', stopNativeMouse, true)
    el.addEventListener('mouseup', stopNativeMouse, true)
    el.addEventListener('pointerdown', stopNativeMouse, true)
    el.addEventListener('pointerup', stopNativeMouse, true)
    el.addEventListener('click', stopNativeMouse, true)
    el.addEventListener('dragenter', handleNativeDragOver, true)
    el.addEventListener('dragover', handleNativeDragOver, true)
    el.addEventListener('dragleave', handleNativeDragLeave, true)
    el.addEventListener('drop', handleNativeDrop, true)

    return () => {
      el.removeEventListener('mousedown', stopNativeMouse, true)
      el.removeEventListener('mouseup', stopNativeMouse, true)
      el.removeEventListener('pointerdown', stopNativeMouse, true)
      el.removeEventListener('pointerup', stopNativeMouse, true)
      el.removeEventListener('click', stopNativeMouse, true)
      el.removeEventListener('dragenter', handleNativeDragOver, true)
      el.removeEventListener('dragover', handleNativeDragOver, true)
      el.removeEventListener('dragleave', handleNativeDragLeave, true)
      el.removeEventListener('drop', handleNativeDrop, true)
    }
  }, [selectedUrl])

  const onSubmit = async (data: FormInputs) => {
    try {
      await createMemory(collectionId, data, selectedFile, onSuccess, showNotification)
      reset()
      onClose()
    } catch (err) {
      console.error('Failed to create memory item:', err)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div key="create-memory-item-wrapper" className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: colorManagement.memoryItemModal.backdropBackground }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-md border rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: colorManagement.memoryItemModal.dialog.backgroundColor,
            borderColor: colorManagement.memoryItemModal.dialog.borderColor,
            color: colorManagement.memoryItemModal.dialog.textColor,
            ['--input-focus-color' as any]: colorManagement.memoryItemModal.form.inputFocusBorderColor,
          }}
        >
          <div
            className="flex items-center justify-between mb-5 pb-3 border-b"
            style={{ borderColor: colorManagement.memoryItemModal.header.dividerColor }}
          >
            <h3
              className="text-lg font-bold"
              style={{ color: colorManagement.memoryItemModal.header.titleColor }}
            >
              Create Memory Item
            </h3>
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: isCloseHovered
                  ? colorManagement.memoryItemModal.header.closeButton.hoverBackgroundColor
                  : colorManagement.memoryItemModal.header.closeButton.backgroundColor,
                color: isCloseHovered
                  ? colorManagement.memoryItemModal.header.closeButton.hoverTextColor
                  : colorManagement.memoryItemModal.header.closeButton.textColor,
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colorManagement.memoryItemModal.form.labelColor }}
              >
                Memory Name{' '}
                <span style={{ color: colorManagement.memoryItemModal.form.requiredColor }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. First Dinner Date"
                {...register('name', { required: 'Memory name is required' })}
                className="w-full border focus:border-[var(--input-focus-color)] focus:ring-1 focus:ring-[var(--input-focus-color)] rounded-xl px-3.5 py-2 text-sm outline-none transition-all"
                style={{
                  backgroundColor: colorManagement.memoryItemModal.form.inputBackground,
                  borderColor: colorManagement.memoryItemModal.form.inputBorderColor,
                  color: colorManagement.memoryItemModal.form.inputTextColor,
                }}
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: colorManagement.memoryItemModal.form.errorColor }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: colorManagement.memoryItemModal.form.labelColor }}
                >
                  Memory Date
                </label>
                <input
                  type="date"
                  {...register('memory_date')}
                  className="w-full border focus:border-[var(--input-focus-color)] focus:ring-1 focus:ring-[var(--input-focus-color)] rounded-xl px-3.5 py-2 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: colorManagement.memoryItemModal.form.inputBackground,
                    borderColor: colorManagement.memoryItemModal.form.inputBorderColor,
                    color: colorManagement.memoryItemModal.form.inputTextColor,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-wider mb-1"
                  style={{ color: colorManagement.memoryItemModal.form.labelColor }}
                >
                  Order
                </label>
                <input
                  type="number"
                  min={1}
                  {...register('order', { valueAsNumber: true })}
                  className="w-full border focus:border-[var(--input-focus-color)] focus:ring-1 focus:ring-[var(--input-focus-color)] rounded-xl px-3.5 py-2 text-sm outline-none transition-all"
                  style={{
                    backgroundColor: colorManagement.memoryItemModal.form.inputBackground,
                    borderColor: colorManagement.memoryItemModal.form.inputBorderColor,
                    color: colorManagement.memoryItemModal.form.inputTextColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colorManagement.memoryItemModal.form.labelColor }}
              >
                Description / Notes
              </label>
              <textarea
                rows={3}
                placeholder="Write details about this memory moment..."
                {...register('description')}
                className="w-full border focus:border-[var(--input-focus-color)] focus:ring-1 focus:ring-[var(--input-focus-color)] rounded-xl px-3.5 py-2 text-sm outline-none transition-all resize-none"
                style={{
                  backgroundColor: colorManagement.memoryItemModal.form.inputBackground,
                  borderColor: colorManagement.memoryItemModal.form.inputBorderColor,
                  color: colorManagement.memoryItemModal.form.inputTextColor,
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: colorManagement.memoryItemModal.form.labelColor }}
              >
                Memory Image
              </label>
              <div className="relative w-full">
                {selectedUrl ? (
                  <div
                    className="relative group w-full h-56 rounded-xl overflow-hidden border shadow-sm"
                    style={{ borderColor: colorManagement.memoryItemModal.preview.borderColor }}
                  >
                    <img src={selectedUrl} alt="Memory Image" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setSelectedUrl(null); setSelectedFile(null) }}
                      onMouseEnter={() => setIsDeleteHovered(true)}
                      onMouseLeave={() => setIsDeleteHovered(false)}
                      className="absolute top-2 right-2 px-3 py-1 font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer z-10"
                      style={{
                        backgroundColor: isDeleteHovered
                          ? colorManagement.memoryItemModal.preview.deleteButton.hoverBackgroundColor
                          : colorManagement.memoryItemModal.preview.deleteButton.backgroundColor,
                        color: colorManagement.memoryItemModal.preview.deleteButton.textColor,
                      }}
                    >
                      Delete
                    </button>
                    <label
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: colorManagement.memoryItemModal.preview.overlayBackground }}
                    >
                      <span
                        className="px-4 py-2 font-semibold text-xs rounded-xl shadow"
                        style={{
                          backgroundColor: colorManagement.memoryItemModal.preview.changeButton.backgroundColor,
                          color: colorManagement.memoryItemModal.preview.changeButton.textColor,
                        }}
                      >
                        Change Image
                      </span>
                      <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]) }} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label
                    ref={dropzoneRef}
                    onMouseEnter={() => setIsDropzoneHovered(true)}
                    onMouseLeave={() => setIsDropzoneHovered(false)}
                    className={`w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
                      isDragging ? 'scale-[1.01]' : ''
                    }`}
                    style={{
                      borderColor: isDragging
                        ? colorManagement.memoryItemModal.dropzone.draggingBorderColor
                        : isDropzoneHovered
                        ? colorManagement.memoryItemModal.dropzone.hoverBorderColor
                        : colorManagement.memoryItemModal.dropzone.borderColor,
                      backgroundColor: isDragging
                        ? colorManagement.memoryItemModal.dropzone.draggingBackgroundColor
                        : isDropzoneHovered
                        ? colorManagement.memoryItemModal.dropzone.hoverBackgroundColor
                        : colorManagement.memoryItemModal.dropzone.backgroundColor,
                    }}
                  >
                    <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]) }} onClick={(e) => e.stopPropagation()} className="hidden" />
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold mb-1.5"
                      style={{
                        backgroundColor: colorManagement.memoryItemModal.dropzone.plusBg,
                        color: colorManagement.memoryItemModal.dropzone.plusColor,
                      }}
                    >
                      +
                    </div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: colorManagement.memoryItemModal.dropzone.textColor }}
                    >
                      Drag or drop your image over there
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: colorManagement.memoryItemModal.dropzone.subtextColor }}
                    >
                      Supports PNG, JPG, WEBP
                    </p>
                  </label>
                )}
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-3 pt-3 border-t"
              style={{ borderColor: colorManagement.memoryItemModal.footer.dividerColor }}
            >
              <button
                type="button"
                onClick={onClose}
                onMouseEnter={() => setIsCancelHovered(true)}
                onMouseLeave={() => setIsCancelHovered(false)}
                className="px-4 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer"
                style={{
                  borderColor: colorManagement.memoryItemModal.footer.cancelButton.borderColor,
                  backgroundColor: isCancelHovered
                    ? colorManagement.memoryItemModal.footer.cancelButton.hoverBackgroundColor
                    : 'transparent',
                  color: colorManagement.memoryItemModal.footer.cancelButton.textColor,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onMouseEnter={() => setIsSubmitHovered(true)}
                onMouseLeave={() => setIsSubmitHovered(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{
                  backgroundColor: isSubmitHovered
                    ? colorManagement.memoryItemModal.footer.submitButton.hoverBackgroundColor
                    : colorManagement.memoryItemModal.footer.submitButton.backgroundColor,
                  color: colorManagement.memoryItemModal.footer.submitButton.textColor,
                  boxShadow: colorManagement.memoryItemModal.footer.submitButton.shadowColor,
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create Memory'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
