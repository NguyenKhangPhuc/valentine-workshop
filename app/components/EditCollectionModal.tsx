'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { updateCollection, updateCollectionPoster } from '../actions/collection'
import { handleGetUrl } from '../helpers/file_url'
import { createClient } from '../utils/supabase/client'

interface EditCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  collection: CollectionWithItems
  onSuccess: (updatedCollection: CollectionWithItems) => void
}

interface FormInputs {
  name: string
  description: string
  start_time: string
  end_time: string
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

export function EditCollectionModal({
  isOpen,
  onClose,
  collection,
  onSuccess,
}: EditCollectionModalProps) {
  const initialResolvedUrl = useMemo(() => {
    return resolveImageUrl(collection?.poster_url || null)
  }, [collection?.poster_url])

  const [selectedUrl, setSelectedUrl] = useState<string | null>(initialResolvedUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const dropzoneRef = useRef<HTMLLabelElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      name: '',
      description: '',
      start_time: '',
      end_time: '',
    },
  })

  useEffect(() => {
    if (collection) {
      setValue('name', collection.name || '')
      setValue('description', collection.description || '')
      setValue('start_time', collection.start_time ? collection.start_time.split('T')[0] : '')
      setValue('end_time', collection.end_time ? collection.end_time.split('T')[0] : '')
      setSelectedUrl(initialResolvedUrl)
      setSelectedFile(null)
    }
  }, [collection, setValue, initialResolvedUrl, isOpen])



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

  const handleDeletePoster = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedUrl(null)
    setSelectedFile(null)

    if (collection) {
      updateCollectionPoster(collection, null).catch((err) =>
        console.error('Failed to delete poster:', err)
      )
    }
  }

  const handleFileChange = async (file: File): Promise<void> => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSelectedUrl(url)

    try {
      const { error } = await updateCollectionPoster(collection, file)
      if (error) {
        throw new Error(error)
      }
      const updatedPayload = {
        ...collection, poster_url: url
      }
      onSuccess(updatedPayload)
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
    if (!collection) return
    try {


      const updatePayload = {
        id: collection.id,
        name: data.name,
        description: data.description || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
      }

      const res = await updateCollection(updatePayload)
      const updatedCollection: CollectionWithItems = {
        ...collection,
        ...updatePayload,
      }

      onSuccess(updatedCollection)
      onClose()
    } catch (err) {
      console.error('Failed to update collection:', err)
    }
  }

  if (!isOpen || !collection) return null

  return (
    <AnimatePresence>
      <div key="edit-collection-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modal Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg bg-white border border-[#e9dcf5] rounded-2xl p-6 sm:p-8 shadow-2xl z-10 text-[#1f0c33]"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e9dcf5]">
            <h3 className="text-xl font-bold text-[#1f0c33]">Edit Collection</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer"
              type="button"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Collection Name */}
            <div>
              <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1.5">
                Collection Name <span className="text-[#b63add]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Summer Memories in Finland"
                {...register('name', { required: 'Collection name is required' })}
                className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] outline-none transition-all"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Write a memory description..."
                {...register('description')}
                className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] outline-none transition-all resize-none"
              />
            </div>

            {/* Start & End Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('start_time')}
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  {...register('end_time')}
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] outline-none transition-all"
                />
              </div>
            </div>

            {/* Poster Dropzone Area (Replacing text URL input) */}
            <div>
              <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1.5">
                Collection Poster Image
              </label>
              <div className="relative w-full">
                {selectedUrl ? (
                  <div className="relative group w-full h-44 rounded-xl overflow-hidden border border-[#e9dcf5] shadow-sm">
                    <img
                      src={selectedUrl}
                      alt="Collection Poster"
                      className="w-full h-full object-cover"
                    />
                    {/* Top-Right Delete Button */}
                    <button
                      type="button"
                      onClick={handleDeletePoster}
                      className="absolute top-2 right-2 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer z-10"
                    >
                      Delete
                    </button>
                    {/* Change Image Label overlay on hover */}
                    <label className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="px-4 py-2 bg-white text-[#b63add] font-semibold text-xs rounded-xl shadow">
                        Change Poster Image
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
                    className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${isDragging
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
                    <div className="w-10 h-10 rounded-full bg-[#f4e6fc] text-[#b63add] flex items-center justify-center text-xl font-bold mb-2">
                      +
                    </div>
                    <p className="text-xs font-semibold text-[#b63add]">
                      Drag or drop your image over there
                    </p>
                    <p className="text-[10px] text-[#9681ab] mt-1">
                      Supports PNG, JPG, WEBP
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e9dcf5]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#e9dcf5] hover:bg-gray-50 text-[#5c4775] text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white text-sm font-semibold transition-all shadow-md shadow-[#b63add]/30 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
