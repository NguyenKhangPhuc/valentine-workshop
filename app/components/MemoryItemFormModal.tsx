'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { CollectionItem } from '../types/collection_item'
import { createNewCollectionItem, updateCollectionItem } from '../actions/collection_items'

interface MemoryItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  collectionId: string
  itemToEdit?: CollectionItem | null
  onSuccess: (item: CollectionItem, isEdit: boolean) => void
}

interface FormInputs {
  name: string
  description: string
  memory_date: string
  image_url: string
}

export function MemoryItemFormModal({
  isOpen,
  onClose,
  collectionId,
  itemToEdit,
  onSuccess,
}: MemoryItemFormModalProps) {
  const isEditing = !!itemToEdit

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      name: '',
      description: '',
      memory_date: '',
      image_url: '',
    },
  })

  useEffect(() => {
    if (itemToEdit) {
      setValue('name', itemToEdit.name || '')
      setValue('description', itemToEdit.description || '')
      setValue('memory_date', itemToEdit.memory_date ? itemToEdit.memory_date.split('T')[0] : '')
      setValue('image_url', itemToEdit.image_url || '')
    } else {
      reset({
        name: '',
        description: '',
        memory_date: '',
        image_url: '',
      })
    }
  }, [itemToEdit, setValue, reset, isOpen])

  const onSubmit = async (data: FormInputs) => {
    try {
      if (isEditing && itemToEdit) {
        const payload = {
          id: itemToEdit.id,
          name: data.name,
          description: data.description,
          memory_date: data.memory_date || null,
          image_url: data.image_url || null,
        }
        const res = await updateCollectionItem(payload)
        if (res?.error) {
          alert(res.error)
          return
        }
        if (res?.data) {
          onSuccess(res.data, true)
        }
      } else {
        const payload = {
          collection_id: collectionId,
          name: data.name,
          description: data.description,
          memory_date: data.memory_date || null,
          image_url: data.image_url || null,
        }
        const res = await createNewCollectionItem(payload)
        if (res?.error) {
          alert(res.error)
          return
        }
        if (res?.data) {
          onSuccess(res.data, false)
        }
      }
      reset()
      onClose()
    } catch (err) {
      console.error('Failed to save memory item:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
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

              <div>
                <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">
                  Memory Date
                </label>
                <input
                  type="date"
                  {...register('memory_date')}
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Write details about this memory moment..."
                  {...register('description')}
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1">
                  Image Path / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. memories/photo1.jpg or https://..."
                  {...register('image_url')}
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-3.5 py-2 text-sm text-[#1f0c33] outline-none transition-all"
                />
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
      )}
    </AnimatePresence>
  )
}
