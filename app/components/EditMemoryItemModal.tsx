'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { CollectionItem } from '../types/collection_item'
import { createNewCollectionItem, updateCollectionItem, updateCollectionItemPoster } from '../actions/collection_items'
import { handleGetUrl } from '../helpers/file_url'
import { createClient } from '../utils/supabase/client'

interface MemoryItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  collectionId: string
  itemToEdit: CollectionItem
  onSuccess: (item: CollectionItem, isEdit: boolean) => void
}

interface FormInputs {
  name: string
  description: string
  memory_date: string
  order: number
}

function resolveImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  if (
    imagePath.startsWith('/') ||
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath
  }
  try {
    const supabase = createClient()
    return handleGetUrl(supabase, imagePath)
  } catch {
    return imagePath
  }
}

export function EditMemoryItemModal({
  isOpen,
  onClose,
  collectionId,
  itemToEdit,
  onSuccess,
}: MemoryItemFormModalProps) {
  const isEditing = !!itemToEdit

  const initialResolvedUrl = useMemo(() => {
    return resolveImageUrl(itemToEdit?.image_url || null)
  }, [itemToEdit?.image_url])

  const [selectedUrl, setSelectedUrl] = useState<string | null>(initialResolvedUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const dropzoneRef = useRef<HTMLLabelElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      name: itemToEdit.name ?? "",
      description: itemToEdit.description ?? "",
      memory_date: itemToEdit.memory_date ?? "",
      order: itemToEdit.order ?? 1,
    },
  })




  // Native capture-phase listeners for drag and drop
  useEffect(() => {
    const el = dropzoneRef.current
    if (!el) return

    const stopNativeMouse = (e: Event) => {
      e.stopPropagation()
      if (e.stopImmediatePropagation) e.stopImmediatePropagation()
    }

    const handleNativeDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
      setIsDragging(true)
    }

    const handleNativeDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
    }

    const handleNativeDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files[0])
      }
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

  const handleDeleteImage = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      updateCollectionItemPoster(itemToEdit, null)
      setSelectedUrl(null)
      setSelectedFile(null)
      const updatedPayload = {
        ...itemToEdit, image_url: null
      }
      onSuccess(updatedPayload, false)
    } catch (error) {
      console.log(error)
    }

  }

  const handleFileChange = async (file: File): Promise<void> => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSelectedUrl(url)

    try {
      const { error } = await updateCollectionItemPoster(itemToEdit, file)
      if (error) {
        throw new Error(error)
      }
      const updatedPayload = {
        ...itemToEdit, image_url: url
      }
      onSuccess(updatedPayload, true)
      // showNotification("Update image successfully")
    } catch (error) {
      if (error instanceof Error) {
        // showNotification(error.message)
      } else {
        // showNotification("Failed to update poster image.")
      }
    } finally {
      // setIsOpenLoader(false)
    }
  }

  const onSubmit = async (data: FormInputs) => {
    try {
      const payload = {
        id: itemToEdit.id,
        name: data.name,
        description: data.description,
        memory_date: data.memory_date || null,
        order: data.order
      }
      const res = await updateCollectionItem(payload)
      if (res.data) {
        onSuccess(res.data, true)
        reset()
        onClose()
      }
    } catch (err) {
      console.error('Failed to save memory item:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div key="memory-item-form-wrapper" className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-md bg-white border border-[#e9dcf5] rounded-2xl p-6 shadow-2xl z-10 text-[#1f0c33]"
      >
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#e9dcf5]">
          <h3 className="text-lg font-bold text-[#1f0c33]">
            {isEditing ? 'Edit Memory Item' : 'Create Memory Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">
              Memory Name <span className="text-[#b63add]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. First Dinner Date"
              {...register('name', { required: 'Memory name is required' })}
              className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all"
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">Memory Date</label>
              <input
                type="date"
                {...register('memory_date')}
                className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">Order</label>
              <input
                type="number"
                min={1}
                {...register('order', { valueAsNumber: true })}
                className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Write details about this memory moment..."
              {...register('description')}
              className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all resize-none"
            />
          </div>

          {/* Rectangular Image Dropzone Area (Replacing text URL input) */}
          <div>
            <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">
              Memory Image
            </label>
            <div className="relative w-full">
              {selectedUrl ? (
                <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-[#e9dcf5] shadow-sm">
                  <img
                    src={selectedUrl}
                    alt="Memory Image"
                    className="w-full h-full object-contain"
                  />
                  {/* Top-Right Delete Button */}
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute top-2 right-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer z-10"
                  >
                    Delete
                  </button>
                  {/* Change Image Label overlay on hover */}
                  <label className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="px-4 py-2 bg-white text-[#b63add] font-semibold text-xs rounded-xl shadow">
                      Change Image
                    </span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => {
                        const files = e.target.files
                        if (files && files.length > 0) {
                          handleFileChange(files[0])
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label
                  ref={dropzoneRef}
                  className={`w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${isDragging
                    ? 'border-[#b63add] bg-[#f4e6fc]/60 scale-[1.01]'
                    : 'border-[#b63add]/40 bg-[#fcfbfe] hover:border-[#b63add] hover:bg-[#f4e6fc]/20'
                    }`}
                >
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files && files.length > 0) {
                        handleFileChange(files[0])
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-9 h-9 rounded-full bg-[#f4e6fc] text-[#b63add] flex items-center justify-center text-lg font-bold mb-1.5">
                    +
                  </div>
                  <p className="text-xs font-semibold text-[#b63add]">
                    Drag or drop your image over there
                  </p>
                  <p className="text-[10px] text-[#9681ab] mt-0.5">
                    Supports PNG, JPG, WEBP
                  </p>
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e9dcf5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e9dcf5] hover:bg-gray-50 text-[#5c4775] text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white text-xs font-semibold transition-all shadow-md shadow-[#b63add]/30 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Memory'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
