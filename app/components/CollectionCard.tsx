'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { handleGetUrl } from '../helpers/file_url'
import { createClient } from '../utils/supabase/client'

interface CollectionCardProps {
  collection: CollectionWithItems
  onView?: (collection: CollectionWithItems) => void
  onEdit?: (collection: CollectionWithItems) => void
  onDelete?: (collectionId: string) => void
}

export function CollectionCard({ collection, onView, onEdit, onDelete }: CollectionCardProps) {
  const [imageError, setImageError] = useState(false)

  const imageUrl = useMemo(() => {
    if (!collection.poster_url || collection.poster_url.trim() === '') {
      return null
    }
    if (
      collection.poster_url.startsWith('/') ||
      collection.poster_url.startsWith('http://') ||
      collection.poster_url.startsWith('https://') ||
      collection.poster_url.startsWith('data:') ||
      collection.poster_url.startsWith('blob:')
    ) {
      return collection.poster_url
    }
    try {
      const supabase = createClient()
      return handleGetUrl(supabase, collection.poster_url)
    } catch {
      return null
    }
  }, [collection.poster_url])

  // Reset error state if poster_url changes
  useEffect(() => {
    setImageError(false)
  }, [imageUrl])

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
      className="group relative bg-white border border-[#e9dcf5] hover:border-[#b63add] rounded-2xl overflow-hidden flex flex-col h-[460px] shadow-sm hover:shadow-xl hover:shadow-[#b63add]/10 transition-all"
    >
      {/* Poster Image Container or Placeholder */}
      <div className="relative w-full h-48 bg-[#fcfbfe] overflow-hidden shrink-0">
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={collection.name || 'Collection Poster'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#faf0fe] via-[#fcfbfe] to-[#f5dcfd]/40 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#e9dcf5] shadow-xs flex items-center justify-center text-[#9681ab] mb-2 group-hover:scale-110 group-hover:text-[#b63add] group-hover:border-[#b63add]/40 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-[#9681ab] group-hover:text-[#624d78] transition-colors tracking-wide">
              No poster URL
            </span>
          </div>
        )}

        {/* Item count badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-[#e9dcf5] px-3 py-1 rounded-full text-xs font-semibold text-[#b63add] shadow-xs">
          {itemsCount} {itemsCount === 1 ? 'Memory' : 'Memories'}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Collection Title */}
          <h4
            className="text-lg font-bold text-[#1f0c33] group-hover:text-[#b63add] transition-colors line-clamp-1 mb-1.5"
            title={collection.name || 'Untitled Collection'}
          >
            {collection.name || 'Untitled Collection'}
          </h4>

          {/* Description */}
          <p className="text-xs text-[#624d78] line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]">
            {collection.description || 'No description provided for this collection.'}
          </p>

          {/* Timeframe & Meta */}
          <div className="space-y-1.5 text-xs text-[#624d78] border-t border-[#f0e6fa] pt-3 mt-auto">
            <div className="flex items-center gap-1.5 text-[#b63add] font-medium min-h-[1.25rem]">
              {(startDateFormatted || endDateFormatted) ? (
                <>
                  <span>Date:</span>
                  <span className="truncate">
                    {startDateFormatted} {endDateFormatted ? ` - ${endDateFormatted}` : ''}
                  </span>
                </>
              ) : (
                <span className="text-[#9681ab] italic">No event date</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[#9681ab] min-h-[1.25rem]">
              {createdDateFormatted ? (
                <>
                  <span>Created:</span>
                  <span>{createdDateFormatted}</span>
                </>
              ) : (
                <span className="italic">Date unknown</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: View, Edit, Delete */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#f0e6fa]">
          <button
            type="button"
            onClick={() => onView?.(collection)}
            className="py-1.5 px-2 bg-[#b63add]/10 hover:bg-[#b63add] border border-[#b63add]/20 hover:border-[#b63add] text-[#b63add] hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          >
            View
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(collection)}
            className="py-1.5 px-2 bg-[#fcfbfe] hover:bg-[#f4e6fc] border border-[#e9dcf5] text-[#5c4775] hover:text-[#b63add] text-xs font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
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
