'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { handleGetUrl } from '../helpers/file_url'
import { createClient } from '../utils/supabase/client'
import { colorManagement } from './tasks/color-management'

interface CollectionCardProps {
  collection: CollectionWithItems
  onView?: (collection: CollectionWithItems) => void
  onEdit?: (collection: CollectionWithItems) => void
  onDelete?: (collectionId: string) => void
}

export function CollectionCard({ collection, onView, onEdit, onDelete }: CollectionCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<'view' | 'edit' | 'delete' | null>(null)

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
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className="group relative rounded-2xl overflow-hidden flex flex-col h-[460px] border transition-all"
      style={{
        backgroundColor: colorManagement.collectionCard.backgroundColor,
        borderColor: isCardHovered
          ? colorManagement.collectionCard.hoverBorderColor
          : colorManagement.collectionCard.borderColor,
        boxShadow: isCardHovered
          ? colorManagement.collectionCard.hoverShadowColor
          : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
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
        <div
          className="absolute top-3 right-3 backdrop-blur-md border px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
          style={{
            color: colorManagement.collectionCard.badgeColor,
            backgroundColor: colorManagement.collectionCard.badgeBackgroundColor,
            borderColor: colorManagement.collectionCard.borderColor,
          }}
        >
          {itemsCount} {itemsCount === 1 ? 'Memory' : 'Memories'}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Collection Title */}
          <h4
            className="text-lg font-bold transition-colors line-clamp-1 mb-1.5"
            style={{
              color: isCardHovered
                ? colorManagement.collectionCard.hoverTitleColor
                : colorManagement.collectionCard.titleColor,
            }}
            title={collection.name || 'Untitled Collection'}
          >
            {collection.name || 'Untitled Collection'}
          </h4>

          {/* Description */}
          <p
            className="text-xs line-clamp-2 mb-4 leading-relaxed min-h-[2.5rem]"
            style={{
              color: colorManagement.collectionCard.descriptionColor,
            }}
          >
            {collection.description || 'No description provided for this collection.'}
          </p>

          {/* Timeframe & Meta */}
          <div className="space-y-1.5 text-xs text-[#624d78] border-t border-[#f0e6fa] pt-3 mt-auto">
            <div
              className="flex items-center gap-1.5 font-medium min-h-[1.25rem]"
              style={{ color: colorManagement.collectionCard.badgeColor }}
            >
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
            onMouseEnter={() => setHoveredButton('view')}
            onMouseLeave={() => setHoveredButton(null)}
            className="py-1.5 px-2 border text-xs font-semibold rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: hoveredButton === 'view'
                ? colorManagement.collectionButtons.view.hoverBackgroundColor
                : colorManagement.collectionButtons.view.backgroundColor,
              borderColor: hoveredButton === 'view'
                ? colorManagement.collectionButtons.view.hoverBorderColor
                : colorManagement.collectionButtons.view.borderColor,
              color: hoveredButton === 'view'
                ? colorManagement.collectionButtons.view.hoverTextColor
                : colorManagement.collectionButtons.view.textColor,
            }}
          >
            View
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(collection)}
            onMouseEnter={() => setHoveredButton('edit')}
            onMouseLeave={() => setHoveredButton(null)}
            className="py-1.5 px-2 border text-xs font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: hoveredButton === 'edit'
                ? colorManagement.collectionButtons.edit.hoverBackgroundColor
                : colorManagement.collectionButtons.edit.backgroundColor,
              borderColor: colorManagement.collectionButtons.edit.borderColor,
              color: hoveredButton === 'edit'
                ? colorManagement.collectionButtons.edit.hoverTextColor
                : colorManagement.collectionButtons.edit.textColor,
            }}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete?.(collection.id)}
            onMouseEnter={() => setHoveredButton('delete')}
            onMouseLeave={() => setHoveredButton(null)}
            className="py-1.5 px-2 border text-xs font-medium rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: hoveredButton === 'delete'
                ? colorManagement.collectionButtons.delete.hoverBackgroundColor
                : colorManagement.collectionButtons.delete.backgroundColor,
              borderColor: colorManagement.collectionButtons.delete.borderColor,
              color: hoveredButton === 'delete'
                ? colorManagement.collectionButtons.delete.hoverTextColor
                : colorManagement.collectionButtons.delete.textColor,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}
