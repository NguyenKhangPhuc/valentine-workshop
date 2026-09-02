'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { createNewCollection } from '../actions/collection'

interface CreateCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (newCollection: CollectionWithItems) => void
}

interface FormInputs {
  name: string
  description: string
  start_time: string
  end_time: string
  poster_url: string
}

export function CreateCollectionModal({ isOpen, onClose, onCreated }: CreateCollectionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      name: '',
      description: '',
      start_time: '',
      end_time: '',
      poster_url: '',
    },
  })

  const onSubmit = async (data: FormInputs) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        poster_url: data.poster_url || null,
      }

      const res = await createNewCollection(payload)
      let createdCol: CollectionWithItems

      if (res?.data) {
        createdCol = {
          ...res.data,
          collection_items: [],
        }
      } else {
        createdCol = {
          id: 'col-' + Date.now(),
          name: payload.name,
          description: payload.description,
          start_time: payload.start_time,
          end_time: payload.end_time,
          poster_url: payload.poster_url,
          created_at: new Date().toISOString(),
          collection_items: [],
        }
      }
      onCreated?.(createdCol)
      reset()
      onClose()
    } catch (err) {
      console.error('Failed to create collection:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="create-collection-modal-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
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
              <h3 className="text-xl font-bold text-[#1f0c33]">Create New Collection</h3>
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
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] placeholder-gray-400 outline-none transition-all"
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
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] placeholder-gray-400 outline-none transition-all resize-none"
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

              {/* Poster URL */}
              <div>
                <label className="block text-xs font-semibold text-[#5c4775] uppercase tracking-wider mb-1.5">
                  Poster Image Path / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. posters/valentine_trip.jpg"
                  {...register('poster_url')}
                  className="w-full bg-[#fcfbfe] border border-[#e9dcf5] focus:border-[#b63add] focus:ring-1 focus:ring-[#b63add] rounded-xl px-4 py-2.5 text-sm text-[#1f0c33] placeholder-gray-400 outline-none transition-all"
                />
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
                  {isSubmitting ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
