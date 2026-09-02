'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { handleGetUrl } from '../helpers/file_url'
import { createClient } from '../utils/supabase/client'

interface CollectionCardProps {
  collection: CollectionWithItems
  onView?: (collection: CollectionWithItems) => void
  onDelete?: (collectionId: string) => void
}

export function CollectionCard({ collection, onView, onDelete }: CollectionCardProps) {
  const imageUrl = useMemo(() => {
    if (!collection.poster_url) {
      return '/zng_bg.png'
    }
    if (collection.poster_url.startsWith('http://') || collection.poster_url.startsWith('https://')) {
      return collection.poster_url
    }
    try {
      const supabase = createClient()
      return handleGetUrl(supabase, collection.poster_url)
    } catch {
      return '/zng_bg.png'
    }
  }, [collection.poster_url])

  // Format date helper
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const startDateFormatted = formatDate(collection.start_time)
  const endDateFormatted = formatDate(collection.end_time)
  const createdDateFormatted = formatDate(collection.created_at)

  const itemsCount = collection.collection_items ? collection.collection_items.length : 0

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' as const } }}
      className="group relative bg-white border border-[#e9dcf5] hover:border-[#b63add] rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl hover:shadow-[#b63add]/10 transition-all"
    >
      {/* Poster Image Container */}
      <div className="relative w-full h-48 bg-[#fcfbfe] overflow-hidden">
        <img
          src={imageUrl}
          alt={collection.name || 'Collection Poster'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />

        {/* Item count badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-[#e9dcf5] px-3 py-1 rounded-full text-xs font-semibold text-[#b63add] shadow-sm">
          {itemsCount} {itemsCount === 1 ? 'Memory' : 'Memories'}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Collection Title */}
          <h4 className="text-lg font-bold text-[#1f0c33] group-hover:text-[#b63add] transition-colors line-clamp-1 mb-1.5">
            {collection.name || 'Untitled Collection'}
          </h4>

          {/* Description */}
          <p className="text-xs text-[#624d78] line-clamp-2 mb-4 leading-relaxed min-h-[2rem]">
            {collection.description || 'No description provided for this collection.'}
          </p>

          {/* Timeframe & Meta */}
          <div className="space-y-1.5 text-xs text-[#624d78] border-t border-[#f0e6fa] pt-3">
            {(startDateFormatted || endDateFormatted) && (
              <div className="flex items-center gap-1.5 text-[#b63add] font-medium">
                <span>Date:</span>
                <span>
                  {startDateFormatted} {endDateFormatted ? ` - ${endDateFormatted}` : ''}
                </span>
              </div>
            )}
            {createdDateFormatted && (
              <div className="flex items-center gap-1.5 text-[#9681ab]">
                <span>Created:</span>
                <span>{createdDateFormatted}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: View, Edit, Delete */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-3 border-t border-[#f0e6fa]">
          <button
            type="button"
            onClick={() => onView?.(collection)}
            className="py-1.5 px-2 bg-[#b63add]/10 hover:bg-[#b63add] border border-[#b63add]/20 hover:border-[#b63add] text-[#b63add] hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            View
          </button>

          <button
            type="button"
            className="py-1.5 px-2 bg-[#fcfbfe] hover:bg-[#f4e6fc] border border-[#e9dcf5] text-[#5c4775] text-xs font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(collection.id)}
            className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}
