'use client'

import React, { forwardRef, useMemo, useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { CollectionItem } from '../types/collection_item'
import { handleGetUrl } from '../helpers/file_url'
import { createClient } from '../utils/supabase/client'
import { CreateMemoryItemModal } from './CreateMemoryItemModal'
import { EditMemoryItemModal } from './EditMemoryItemModal'
import { deleteCollectionItem } from '../actions/collection_items'
import { editMemoryPoster } from './tasks/task-8'
import { useNotification } from '../context/NotificationContext'
import { colorManagement } from './tasks/color-management'

// Dynamically import HTMLFlipBook to disable SSR
const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false }) as any

interface MemoryBookModalProps {
  collection: CollectionWithItems
  isOpen: boolean
  onClose: () => void
  onUpdateCollectionItems?: (updatedItems: CollectionItem[]) => void
}

interface PageProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

// Helper function to reliably resolve image URLs
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

// ForwardRef wrapper required by react-pageflip
const BookPage = forwardRef<HTMLDivElement, PageProps>(({ children, className = '', style = {} }, ref) => {
  return (
    <div
      ref={ref}
      className="relative w-full h-full overflow-hidden select-none"
    >
      <div
        className={`relative w-full h-full border p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-md ${className}`}
        style={{
          backgroundColor: colorManagement.memoryBookPage.base.backgroundColor,
          borderColor: colorManagement.memoryBookPage.base.borderColor,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
})
BookPage.displayName = 'BookPage'

// Individual Collection Item Page Component with Isolated File Dropzone
function ItemPageContent({
  item,
  pageNum,
  onEditItem,
  onDeleteItem,
  onImageChanged,
}: {
  item: CollectionItem
  pageNum: number
  onEditItem: (item: CollectionItem) => void
  onDeleteItem: (itemId: string) => void
  onImageChanged: (itemId: string, newImageUrl: string | null) => void
}) {
  const { showNotification } = useNotification()
  const serverResolvedUrl = useMemo(() => {
    return resolveImageUrl(item.image_url)
  }, [item.image_url])
  console.log(item)
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(serverResolvedUrl)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditHovered, setIsEditHovered] = useState(false)
  const [isDeleteHovered, setIsDeleteHovered] = useState(false)
  const [isDropzoneHovered, setIsDropzoneHovered] = useState(false)
  const [isChangeImageHovered, setIsChangeImageHovered] = useState(false)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalImageUrl(serverResolvedUrl)
  }, [serverResolvedUrl])


  // Native Capture-Phase Event Listeners attached directly to imageContainerRef
  useEffect(() => {
    const el = imageContainerRef.current
    if (!el) return

    const stopNativeMouse = (e: Event) => {
      e.stopPropagation()
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation()
      }
    }

    const handleNativeDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation()
      }
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy'
      }
      setIsDragging(true)
    }

    const handleNativeDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation()
      }
      setIsDragging(false)
    }

    const handleNativeDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.stopImmediatePropagation) {
        e.stopImmediatePropagation()
      }
      setIsDragging(false)

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files[0])
      }
    }

    el.addEventListener('mousedown', stopNativeMouse, true)
    el.addEventListener('mouseup', stopNativeMouse, true)
    el.addEventListener('pointerdown', stopNativeMouse, true)
    el.addEventListener('pointerup', stopNativeMouse, true)
    el.addEventListener('touchstart', stopNativeMouse, true)
    el.addEventListener('touchend', stopNativeMouse, true)
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
      el.removeEventListener('touchstart', stopNativeMouse, true)
      el.removeEventListener('touchend', stopNativeMouse, true)
      el.removeEventListener('click', stopNativeMouse, true)

      el.removeEventListener('dragenter', handleNativeDragOver, true)
      el.removeEventListener('dragover', handleNativeDragOver, true)
      el.removeEventListener('dragleave', handleNativeDragLeave, true)
      el.removeEventListener('drop', handleNativeDrop, true)
    }
  }, [localImageUrl, item.id])

  const handleFileChange = async (file: File): Promise<void> => {
    if (!file) return

    try {
      await editMemoryPoster(
        item,
        file,
        (updated) => {
          setLocalImageUrl(updated.image_url)
          onImageChanged(updated.id, updated.image_url)
        },
        showNotification
      )
    } catch (error) {
      console.error('Failed to update image:', error)
    }
  }


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

  const memoryDate = formatDate(item.memory_date)

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Toolbar: Edit & Delete buttons */}
      <div
        className="flex items-center justify-between border-b pb-2 flex-shrink-0"
        style={{ borderColor: colorManagement.memoryBookPage.itemPage.toolbar.borderColor }}
      >
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: colorManagement.memoryBookPage.itemPage.toolbar.badgeColor }}
        >
          Memory Item
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditItem(item) }}
            onMouseEnter={() => setIsEditHovered(true)}
            onMouseLeave={() => setIsEditHovered(false)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: isEditHovered
                ? colorManagement.memoryBookPage.itemPage.toolbar.editButton.hoverBackgroundColor
                : colorManagement.memoryBookPage.itemPage.toolbar.editButton.backgroundColor,
              color: isEditHovered
                ? colorManagement.memoryBookPage.itemPage.toolbar.editButton.hoverTextColor
                : colorManagement.memoryBookPage.itemPage.toolbar.editButton.textColor,
            }}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id) }}
            onMouseEnter={() => setIsDeleteHovered(true)}
            onMouseLeave={() => setIsDeleteHovered(false)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: isDeleteHovered
                ? colorManagement.memoryBookPage.itemPage.toolbar.deleteButton.hoverBackgroundColor
                : colorManagement.memoryBookPage.itemPage.toolbar.deleteButton.backgroundColor,
              color: isDeleteHovered
                ? colorManagement.memoryBookPage.itemPage.toolbar.deleteButton.hoverTextColor
                : colorManagement.memoryBookPage.itemPage.toolbar.deleteButton.textColor,
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Image — first, right under toolbar */}
      <div
        ref={imageContainerRef}
        className="w-full h-36 sm:h-48 md:h-56 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {localImageUrl ? (
          <div className="relative group w-full h-full rounded-lg overflow-hidden">
            <img src={localImageUrl} alt={item.name || 'Memory Image'} className="w-full h-full object-contain" />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: colorManagement.memoryBookPage.itemPage.preview.overlayBackground }}
            >
              <label
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsChangeImageHovered(true)}
                onMouseLeave={() => setIsChangeImageHovered(false)}
                className="px-3 py-1.5 font-semibold text-xs rounded-lg shadow cursor-pointer transition-colors"
                style={{
                  backgroundColor: isChangeImageHovered
                    ? colorManagement.memoryBookPage.itemPage.preview.changeButton.hoverBackgroundColor
                    : colorManagement.memoryBookPage.itemPage.preview.changeButton.backgroundColor,
                  color: colorManagement.memoryBookPage.itemPage.preview.changeButton.textColor,
                }}
              >
                Change Image
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => { const files = e.target.files; if (files && files.length > 0) handleFileChange(files[0]) }} onClick={(e) => e.stopPropagation()} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <label
            onMouseEnter={() => setIsDropzoneHovered(true)}
            onMouseLeave={() => setIsDropzoneHovered(false)}
            className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 text-center cursor-pointer transition-all ${
              isDragging ? 'scale-[1.01]' : ''
            }`}
            style={{
              borderColor: isDragging
                ? colorManagement.memoryBookPage.itemPage.dropzone.draggingBorderColor
                : isDropzoneHovered
                ? colorManagement.memoryBookPage.itemPage.dropzone.hoverBorderColor
                : colorManagement.memoryBookPage.itemPage.dropzone.borderColor,
              backgroundColor: isDragging
                ? colorManagement.memoryBookPage.itemPage.dropzone.draggingBackgroundColor
                : isDropzoneHovered
                ? colorManagement.memoryBookPage.itemPage.dropzone.hoverBackgroundColor
                : colorManagement.memoryBookPage.itemPage.dropzone.backgroundColor,
            }}
          >
            <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => { const files = e.target.files; if (files && files.length > 0) handleFileChange(files[0]) }} onClick={(e) => e.stopPropagation()} className="hidden" />
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-base sm:text-lg font-bold mb-1"
              style={{
                backgroundColor: colorManagement.memoryBookPage.itemPage.dropzone.plusBg,
                color: colorManagement.memoryBookPage.itemPage.dropzone.plusColor,
              }}
            >
              +
            </div>
            <p
              className="text-xs font-semibold"
              style={{ color: colorManagement.memoryBookPage.itemPage.dropzone.textColor }}
            >
              Drop your image here
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: colorManagement.memoryBookPage.itemPage.dropzone.subtextColor }}
            >
              Supports PNG, JPG, WEBP
            </p>
          </label>
        )}
      </div>

      {/* Title & Description — horizontal center only */}
      <div className="flex flex-col items-center text-center px-1 overflow-hidden">
        <h4
          className="text-sm sm:text-base font-bold line-clamp-2 leading-tight mb-1"
          style={{ color: colorManagement.memoryBookPage.itemPage.content.titleColor }}
        >
          {item.name || 'Untitled Memory'}
        </h4>
        {memoryDate && (
          <span
            className="text-[10px] font-medium mb-1"
            style={{ color: colorManagement.memoryBookPage.itemPage.content.dateColor }}
          >
            Date: {memoryDate}
          </span>
        )}
        <div
          className="w-full max-h-20 sm:max-h-24 md:max-h-28 overflow-y-auto pr-1.5 text-[11px] leading-relaxed break-words [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-[var(--sb-track)] [&::-webkit-scrollbar-thumb]:bg-[var(--sb-thumb)] hover:[&::-webkit-scrollbar-thumb]:bg-[var(--sb-thumb-hover)]"
          style={{
            color: colorManagement.memoryBookPage.itemPage.content.descriptionColor,
            scrollbarColor: `${colorManagement.memoryBookPage.itemPage.content.scrollbarThumb} ${colorManagement.memoryBookPage.itemPage.content.scrollbarTrack}`,
            ['--sb-track' as any]: colorManagement.memoryBookPage.itemPage.content.scrollbarTrack,
            ['--sb-thumb' as any]: colorManagement.memoryBookPage.itemPage.content.scrollbarThumb,
            ['--sb-thumb-hover' as any]: colorManagement.memoryBookPage.itemPage.content.scrollbarThumbHover,
          }}
        >
          <p>
            {item.description || 'No notes added for this memory moment yet.'}
          </p>
        </div>
      </div>

      {/* Footer: order + page number */}
      <div
        className="border-t pt-2 flex items-center justify-between flex-shrink-0 mt-auto"
        style={{ borderColor: colorManagement.memoryBookPage.itemPage.footer.borderColor }}
      >
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: colorManagement.memoryBookPage.itemPage.footer.orderBadgeBg,
            color: colorManagement.memoryBookPage.itemPage.footer.orderBadgeText,
          }}
        >
          {item.order != null ? `Order: #${item.order}` : 'No order'}
        </span>
        <span
          className="text-[10px] font-medium"
          style={{ color: colorManagement.memoryBookPage.itemPage.footer.pageNumberColor }}
        >
          {pageNum}
        </span>
      </div>
    </div>
  )
}

export function MemoryBookModal({
  collection,
  isOpen,
  onClose,
  onUpdateCollectionItems,
}: MemoryBookModalProps) {
  const flipBookRef = useRef<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [items, setItems] = useState<CollectionItem[]>(collection?.collection_items ?? [])
  const [bookFlipKey, setBookFlipKey] = useState(items.length)
  // Page number input state
  const [pageInput, setPageInput] = useState('1')
  const [isTopCreateHovered, setIsTopCreateHovered] = useState(false)
  const [isTopCloseHovered, setIsTopCloseHovered] = useState(false)
  const [isPrevHovered, setIsPrevHovered] = useState(false)
  const [isNextHovered, setIsNextHovered] = useState(false)
  const [isAddMemoryButtonHovered, setIsAddMemoryButtonHovered] = useState(false)
  const [isEmptyAddHovered, setIsEmptyAddHovered] = useState(false)

  // Viewport tracking for single-page on Phone & iPad vs dual-page on Desktop
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 640
  const isTablet = windowWidth >= 640 && windowWidth < 1024
  const isDesktop = windowWidth >= 1024
  const isSinglePage = !isDesktop // 1 page on Phone & iPad (< 1024px)

  // Dynamic book dimensions
  const bookWidth = useMemo(() => {
    if (isMobile) {
      return Math.min(Math.max(windowWidth - 36, 290), 360)
    }
    return 450
  }, [isMobile, windowWidth])

  const bookHeight = useMemo(() => {
    if (isMobile) {
      return Math.min(Math.max(Math.round(bookWidth * 1.38), 440), 520)
    }
    return 600
  }, [isMobile, bookWidth])

  const activeFlipKey = `${bookFlipKey}-${isSinglePage ? 'single' : 'spread'}-${isMobile ? 'm' : isTablet ? 't' : 'd'}-${bookWidth}`

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<CollectionItem | null>(null)

  const maxPages = useMemo(() => {
    // 1 Front Cover + inner pages count (guaranteed even) + 1 Back Cover
    const innerCount = items.length === 0 ? 2 : items.length % 2 !== 0 ? items.length + 1 : items.length
    return 1 + innerCount + 1
  }, [items.length])

  const posterUrl = useMemo(() => {
    return resolveImageUrl(collection?.poster_url || null)
  }, [collection?.poster_url])

  if (!isOpen || !collection) return null

  const handleNext = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext()
    }
  }

  const handlePrev = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev()
    }
  }

  const onPageFlip = (e: any) => {
    setCurrentPage(e.data)
    setPageInput((e.data + 1).toString())
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value
    setPageInput(valStr)

    const num = parseInt(valStr, 10)
    if (!isNaN(num)) {
      const clamped = Math.max(1, Math.min(num, maxPages))
      if (flipBookRef.current) {
        flipBookRef.current.pageFlip().flip(clamped - 1)
      }
    }
  }

  const handlePageInputBlur = () => {
    const num = parseInt(pageInput, 10)
    if (isNaN(num) || num < 1) {
      setPageInput('1')
      if (flipBookRef.current) flipBookRef.current.pageFlip().flip(0)
    } else if (num > maxPages) {
      setPageInput(maxPages.toString())
      if (flipBookRef.current) flipBookRef.current.pageFlip().flip(maxPages - 1)
    }
  }

  const handleCreateMemoryClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleEditItemClick = (item: CollectionItem) => {
    setItemToEdit(item)
  }

  const handleDeleteItemClick = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this memory item?')) {
      const res = await deleteCollectionItem(itemId)
      if (res?.error) {
        console.warn('DB delete error, removing from local state:', res.error)
      }
      const updated = items.filter((it) => it.id !== itemId)
      setItems(updated)
      setBookFlipKey((prev) => prev + 1)
      onUpdateCollectionItems?.(updated)
    }
  }

  const handleImageChanged = (itemId: string, newImageUrl: string | null) => {
    const updated = items.map((it) => (it.id === itemId ? { ...it, image_url: newImageUrl } : it))
    setItems(updated)
    onUpdateCollectionItems?.(updated)
  }

  const handleCreateSuccess = (newItem: CollectionItem) => {
    const updated = [...items, newItem].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    setItems(updated)
    onUpdateCollectionItems?.(updated)
    setBookFlipKey(bookFlipKey + 1)

  }

  const handleEditSuccess = (savedItem: CollectionItem, isIncrease: boolean) => {
    const updated = items
      .map((it) => (it.id === savedItem.id ? savedItem : it))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    setItems(updated)
    if (isIncrease) {
      setBookFlipKey(bookFlipKey + 1)
    }
    onUpdateCollectionItems?.(updated)
  }

  const bookPages = useMemo(() => {
    const pages: React.ReactElement[] = []

    // 1. Front Cover
    pages.push(
      <BookPage
        key="page-front-cover"
        className="!text-white border-2"
        style={{
          background: colorManagement.memoryBookPage.frontCover.backgroundGradient,
          borderColor: colorManagement.memoryBookPage.frontCover.borderColor,
        }}
      >
        <div className="h-full flex flex-col justify-between items-center text-center p-4">
          <div
            className="w-full border-b pb-3"
            style={{ borderColor: colorManagement.memoryBookPage.frontCover.dividerColor }}
          >
            <span
              className="text-[10px] uppercase font-bold tracking-widest"
              style={{ color: colorManagement.memoryBookPage.frontCover.badgeColor }}
            >
              Memory Book
            </span>
          </div>

          <div className="my-auto flex flex-col items-center max-w-xs">
            {posterUrl && (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 shadow-lg mb-3 sm:mb-4"
                style={{ borderColor: colorManagement.memoryBookPage.frontCover.posterBorderColor }}
              >
                <img
                  src={posterUrl}
                  alt="Collection Cover"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h2
              className="text-xl sm:text-2xl font-black mb-2 leading-tight"
              style={{ color: colorManagement.memoryBookPage.frontCover.titleColor }}
            >
              {collection.name || 'Untitled Collection'}
            </h2>
            <p
              className="text-xs line-clamp-3 leading-relaxed"
              style={{ color: colorManagement.memoryBookPage.frontCover.descriptionColor }}
            >
              {collection.description || 'A cherished collection of romantic memories.'}
            </p>
          </div>

          <div
            className="w-full border-t pt-3"
            style={{ borderColor: colorManagement.memoryBookPage.frontCover.dividerColor }}
          >
            <span
              className="text-[11px] font-semibold"
              style={{ color: colorManagement.memoryBookPage.frontCover.promptColor }}
            >
              Use Navigation Controls Below To Flip
            </span>
          </div>
        </div>
      </BookPage>
    )

    // 2. Inner Pages
    if (items.length > 0) {
      items.forEach((item, idx) => {
        pages.push(
          <BookPage key={`item-page-${item.id && item.id.trim() !== '' ? item.id : 'idx-' + idx}`}>
            <ItemPageContent
              item={item}
              pageNum={idx + 1}
              onEditItem={handleEditItemClick}
              onDeleteItem={handleDeleteItemClick}
              onImageChanged={handleImageChanged}
            />
          </BookPage>
        )
      })

      // Extra page when items count is odd to ensure even inner page count
      if (items.length % 2 !== 0) {
        pages.push(
          <BookPage
            key="page-extra-filler"
            style={{ backgroundColor: colorManagement.memoryBookPage.companionPage.backgroundColor }}
          >
            <div
              className="h-full flex flex-col justify-between items-center text-center p-6 border border-dashed rounded-xl"
              style={{
                borderColor: colorManagement.memoryBookPage.companionPage.borderColor,
                backgroundColor: colorManagement.memoryBookPage.companionPage.cardBackgroundColor,
              }}
            >
              <div
                className="w-full border-b pb-2 flex items-center justify-between text-xs"
                style={{ borderColor: colorManagement.memoryBookPage.companionPage.borderColor }}
              >
                <span
                  className="font-mono text-[11px]"
                  style={{ color: colorManagement.memoryBookPage.companionPage.pageLabelColor }}
                >
                  PAGE {items.length + 1}
                </span>
                <span
                  className="text-[10px] uppercase font-bold tracking-widest"
                  style={{ color: colorManagement.memoryBookPage.companionPage.badgeColor }}
                >
                  Next Chapter
                </span>
              </div>

              <div className="my-auto flex flex-col items-center max-w-xs px-2">
                <div
                  className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-xs"
                  style={{
                    backgroundColor: colorManagement.memoryBookPage.companionPage.iconBoxBg,
                    borderColor: colorManagement.memoryBookPage.companionPage.iconBoxBorder,
                    color: colorManagement.memoryBookPage.companionPage.iconColor,
                  }}
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </div>
                <h4
                  className="text-base sm:text-lg font-bold mb-2"
                  style={{ color: colorManagement.memoryBookPage.companionPage.titleColor }}
                >
                  To Be Continued...
                </h4>
                <p
                  className="text-xs leading-relaxed mb-5"
                  style={{ color: colorManagement.memoryBookPage.companionPage.descriptionColor }}
                >
                  Every shared moment is a page in our story. More sweet memories are yet to come.
                </p>
                <button
                  type="button"
                  onClick={handleCreateMemoryClick}
                  className="px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5 hover:bg-[var(--btn-hover-bg)]"
                  style={{
                    backgroundColor: colorManagement.memoryBookPage.companionPage.button.backgroundColor,
                    color: colorManagement.memoryBookPage.companionPage.button.textColor,
                    boxShadow: colorManagement.memoryBookPage.companionPage.button.shadowColor,
                    ['--btn-hover-bg' as any]: colorManagement.memoryBookPage.companionPage.button.hoverBackgroundColor,
                  }}
                >
                  <span>+</span>
                  <span>Add Another Memory</span>
                </button>
              </div>

              <div
                className="w-full border-t pt-2"
                style={{ borderColor: colorManagement.memoryBookPage.companionPage.borderColor }}
              >
                <span
                  className="text-[10px] italic"
                  style={{ color: colorManagement.memoryBookPage.companionPage.footerTextColor }}
                >
                  Turn the page to close the book
                </span>
              </div>
            </div>
          </BookPage>
        )
      }
    } else {
      // Empty collection: 2 companion pages
      pages.push(
        <BookPage key="page-empty-collection">
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <h4
              className="text-base font-bold mb-2"
              style={{ color: colorManagement.memoryBookPage.companionPage.titleColor }}
            >
              Empty Collection
            </h4>
            <p
              className="text-xs mb-4"
              style={{ color: colorManagement.memoryBookPage.companionPage.descriptionColor }}
            >
              No memory items added to this collection yet.
            </p>
            <button
              type="button"
              onClick={handleCreateMemoryClick}
              className="px-4 py-2 rounded-xl text-xs font-semibold shadow cursor-pointer transition-colors hover:bg-[var(--btn-hover-bg)]"
              style={{
                backgroundColor: colorManagement.memoryBookPage.companionPage.button.backgroundColor,
                color: colorManagement.memoryBookPage.companionPage.button.textColor,
                ['--btn-hover-bg' as any]: colorManagement.memoryBookPage.companionPage.button.hoverBackgroundColor,
              }}
            >
              + Add First Memory
            </button>
          </div>
        </BookPage>
      )
      pages.push(
        <BookPage
          key="page-empty-companion"
          style={{ backgroundColor: colorManagement.memoryBookPage.companionPage.backgroundColor }}
        >
          <div
            className="h-full flex flex-col justify-between items-center text-center p-6 border border-dashed rounded-xl"
            style={{
              borderColor: colorManagement.memoryBookPage.companionPage.borderColor,
              backgroundColor: colorManagement.memoryBookPage.companionPage.cardBackgroundColor,
            }}
          >
            <div
              className="w-full border-b pb-2 flex items-center justify-between text-xs"
              style={{ borderColor: colorManagement.memoryBookPage.companionPage.borderColor }}
            >
              <span
                className="font-mono text-[11px]"
                style={{ color: colorManagement.memoryBookPage.companionPage.pageLabelColor }}
              >
                PAGE 2
              </span>
              <span
                className="text-[10px] uppercase font-bold tracking-widest"
                style={{ color: colorManagement.memoryBookPage.companionPage.badgeColor }}
              >
                Our Beginning
              </span>
            </div>
            <div className="my-auto flex flex-col items-center max-w-xs px-2">
              <div
                className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 shadow-xs"
                style={{
                  backgroundColor: colorManagement.memoryBookPage.companionPage.iconBoxBg,
                  borderColor: colorManagement.memoryBookPage.companionPage.iconBoxBorder,
                  color: colorManagement.memoryBookPage.companionPage.iconColor,
                }}
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h4
                className="text-base font-bold mb-2"
                style={{ color: colorManagement.memoryBookPage.companionPage.titleColor }}
              >
                Write Your Love Story
              </h4>
              <p
                className="text-xs leading-relaxed"
                style={{ color: colorManagement.memoryBookPage.companionPage.descriptionColor }}
              >
                Capture every precious date, anniversary, and unforgettable memory in this digital keepsake.
              </p>
            </div>
            <div
              className="w-full border-t pt-2"
              style={{ borderColor: colorManagement.memoryBookPage.companionPage.borderColor }}
            >
              <span
                className="text-[10px] italic"
                style={{ color: colorManagement.memoryBookPage.companionPage.footerTextColor }}
              >
                Turn the page to close the book
              </span>
            </div>
          </div>
        </BookPage>
      )
    }

    // 3. Back Cover
    pages.push(
      <BookPage
        key="page-back-cover"
        className="!text-white border-2"
        style={{
          backgroundColor: colorManagement.memoryBookPage.backCover.backgroundColor,
          borderColor: colorManagement.memoryBookPage.backCover.borderColor,
        }}
      >
        <div className="h-full flex flex-col justify-between items-center text-center p-6">
          <div
            className="w-full border-b pb-3"
            style={{ borderColor: colorManagement.memoryBookPage.backCover.dividerColor }}
          >
            <span
              className="text-[10px] uppercase font-bold tracking-widest"
              style={{ color: colorManagement.memoryBookPage.backCover.badgeColor }}
            >
              The End
            </span>
          </div>

          <div className="my-auto">
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: colorManagement.memoryBookPage.backCover.titleColor }}
            >
              Memories To Be Continued
            </h3>
            <p
              className="text-xs font-medium tracking-wide"
              style={{ color: colorManagement.memoryBookPage.backCover.subtitleColor }}
            >
              The end of {collection.name || 'this collection'}
            </p>
          </div>

          <div
            className="w-full border-t pt-3"
            style={{ borderColor: colorManagement.memoryBookPage.backCover.dividerColor }}
          >
            <span
              className="text-[10px]"
              style={{ color: colorManagement.memoryBookPage.backCover.footerColor }}
            >
              Created with love
            </span>
          </div>
        </div>
      </BookPage>
    )

    return pages
  }, [items, posterUrl, collection.name, collection.description])

  return (
    <>
      <div key="memory-book-modal-wrapper" className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Dimmed Background Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 backdrop-blur-md"
          style={{ backgroundColor: colorManagement.memoryBookModal.backdropBackground }}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center"
        >
          {/* Top Toolbar: Title, + Create Memory Button, Close Button */}
          <div className="w-full flex items-center justify-between mb-4 px-4 text-white">
            <div>
              <span
                className="text-[11px] font-bold uppercase tracking-widest block"
                style={{ color: colorManagement.memoryBookModal.header.categoryColor }}
              >
                Memory Book
              </span>
              <h3
                className="text-xl sm:text-2xl font-black line-clamp-1"
                style={{ color: colorManagement.memoryBookModal.header.titleColor }}
              >
                {collection.name || 'Untitled Collection'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Create Memory Button */}
              <button
                type="button"
                onClick={handleCreateMemoryClick}
                onMouseEnter={() => setIsTopCreateHovered(true)}
                onMouseLeave={() => setIsTopCreateHovered(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: isTopCreateHovered
                    ? colorManagement.memoryBookModal.header.createButton.hoverBackgroundColor
                    : colorManagement.memoryBookModal.header.createButton.backgroundColor,
                  color: colorManagement.memoryBookModal.header.createButton.textColor,
                  boxShadow: colorManagement.memoryBookModal.header.createButton.shadowColor,
                }}
              >
                <span>+</span>
                <span>Create Memory</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                onMouseEnter={() => setIsTopCloseHovered(true)}
                onMouseLeave={() => setIsTopCloseHovered(false)}
                className="w-9 h-9 rounded-full font-bold flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: isTopCloseHovered
                    ? colorManagement.memoryBookModal.header.closeButton.hoverBackgroundColor
                    : colorManagement.memoryBookModal.header.closeButton.backgroundColor,
                  color: colorManagement.memoryBookModal.header.closeButton.textColor,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* FlipBook Container: 1 Page on Phone/iPad, 2-Page Spread on Desktop */}
          <div
            className={`relative shadow-2xl rounded-2xl overflow-hidden p-2 sm:p-4 transition-all duration-300 flex justify-center ${
              isSinglePage ? 'w-full max-w-[380px] sm:max-w-[500px]' : 'max-w-full'
            }`}
            style={{ background: colorManagement.memoryBookModal.glowGradient }}
          >
            <HTMLFlipBook
              key={activeFlipKey}
              ref={flipBookRef}
              width={bookWidth}
              height={bookHeight}
              size="fixed"
              minWidth={isMobile ? 290 : 320}
              maxWidth={500}
              minHeight={isMobile ? 440 : 500}
              maxHeight={650}
              maxShadowOpacity={0.5}
              showCover={true}
              usePortrait={isSinglePage}
              mobileScrollSupport={false}
              useMouseEvents={false}
              clickEventForward={false}
              showPageCorners={false}
              swipeDistance={0}
              onFlip={onPageFlip}
              className="mx-auto rounded-lg"
            >
              {bookPages}
            </HTMLFlipBook>
          </div>

          {/* Bottom Navigation Controls & Page Number Input */}
          <div className="flex items-center gap-4 mt-5">
            <button
              type="button"
              onClick={handlePrev}
              onMouseEnter={() => setIsPrevHovered(true)}
              onMouseLeave={() => setIsPrevHovered(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer"
              style={{
                backgroundColor: isPrevHovered
                  ? colorManagement.memoryBookModal.navigation.prevButton.hoverBackgroundColor
                  : colorManagement.memoryBookModal.navigation.prevButton.backgroundColor,
                borderColor: colorManagement.memoryBookModal.navigation.prevButton.borderColor,
                color: colorManagement.memoryBookModal.navigation.prevButton.textColor,
              }}
            >
              Previous Page
            </button>

            {/* Interactive Page Input Navigation */}
            <div
              className="flex items-center gap-1.5 backdrop-blur-md border rounded-xl px-3 py-1.5 text-xs"
              style={{
                backgroundColor: colorManagement.memoryBookModal.navigation.pageInput.containerBg,
                borderColor: colorManagement.memoryBookModal.navigation.pageInput.containerBorder,
              }}
            >
              <span
                className="font-medium"
                style={{ color: colorManagement.memoryBookModal.navigation.pageInput.labelColor }}
              >
                Page
              </span>
              <input
                type="number"
                min={1}
                max={maxPages}
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                className="w-12 text-center font-bold rounded px-1 py-0.5 outline-none border focus:border-[var(--page-focus-color)]"
                style={{
                  backgroundColor: colorManagement.memoryBookModal.navigation.pageInput.inputBg,
                  borderColor: colorManagement.memoryBookModal.navigation.pageInput.inputBorder,
                  color: colorManagement.memoryBookModal.navigation.pageInput.inputTextColor,
                  ['--page-focus-color' as any]: colorManagement.memoryBookModal.navigation.pageInput.inputFocusBorder,
                }}
              />
              <span
                className="font-medium"
                style={{ color: colorManagement.memoryBookModal.navigation.pageInput.labelColor }}
              >
                / {maxPages}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              onMouseEnter={() => setIsNextHovered(true)}
              onMouseLeave={() => setIsNextHovered(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer"
              style={{
                backgroundColor: isNextHovered
                  ? colorManagement.memoryBookModal.navigation.nextButton.hoverBackgroundColor
                  : colorManagement.memoryBookModal.navigation.nextButton.backgroundColor,
                color: colorManagement.memoryBookModal.navigation.nextButton.textColor,
                boxShadow: colorManagement.memoryBookModal.navigation.nextButton.shadowColor,
              }}
            >
              Next Page
            </button>
          </div>
        </motion.div>
      </div>

      {/* Create Memory Item Modal */}
      <CreateMemoryItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        collectionId={collection.id}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Memory Item Modal */}
      {itemToEdit && (
        <EditMemoryItemModal
          collectionId={collection.id}
          isOpen={!!itemToEdit}
          onClose={() => setItemToEdit(null)}
          itemToEdit={itemToEdit}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
