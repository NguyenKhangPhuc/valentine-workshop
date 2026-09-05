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
import { deleteCollectionItem, updateCollectionItem, updateCollectionItemPoster } from '../actions/collection_items'

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
const BookPage = forwardRef<HTMLDivElement, PageProps>(({ children, className = '' }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative w-full h-full bg-white border border-[#e9dcf5] p-6 sm:p-8 flex flex-col justify-between overflow-hidden select-none shadow-md ${className}`}
    >
      {children}
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
  const serverResolvedUrl = useMemo(() => {
    return resolveImageUrl(item.image_url)
  }, [item.image_url])
  console.log(item)
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(serverResolvedUrl)
  const [isDragging, setIsDragging] = useState(false)

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
    const url = URL.createObjectURL(file)
    setLocalImageUrl(url)

    try {
      const { error } = await updateCollectionItemPoster(item, file)
      if (error) {
        throw new Error(error)
      }
      const updatedPayload = {
        ...item, poster_url: url
      }
      onImageChanged(updatedPayload.id, url)
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

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      updateCollectionItem({
        id: item.id,
        image_url: null,
      })
      setLocalImageUrl(null)
      onImageChanged(item.id, null)
    } catch (error) {
      console.log("Failed to update the image")
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
      <div className="flex items-center justify-between border-b border-[#e9dcf5] pb-2 flex-shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#b63add]">
          Memory Item
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEditItem(item) }}
            className="px-2.5 py-1 bg-[#b63add]/10 hover:bg-[#b63add] text-[#b63add] hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id) }}
            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Image — first, right under toolbar */}
      <div
        ref={imageContainerRef}
        className="w-full h-56 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {localImageUrl ? (
          <div className="relative group w-full h-full rounded-lg overflow-hidden">
            <img src={localImageUrl} alt={item.name || 'Memory Image'} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" onClick={handleRemoveImage} className="px-3 py-1.5 bg-white text-rose-600 font-semibold text-xs rounded-lg shadow cursor-pointer hover:bg-rose-50 transition-colors">Remove</button>
              <label onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 bg-[#b63add] text-white font-semibold text-xs rounded-lg shadow cursor-pointer hover:bg-[#9c28bd] transition-colors">
                Change Image
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => { const files = e.target.files; if (files && files.length > 0) handleFileChange(files[0]) }} onClick={(e) => e.stopPropagation()} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <label className={`w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${isDragging ? 'border-[#b63add] bg-[#f4e6fc]/60 scale-[1.01]' : 'border-[#b63add]/40 bg-[#fcfbfe] hover:border-[#b63add] hover:bg-[#f4e6fc]/20'
            }`}>
            <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => { const files = e.target.files; if (files && files.length > 0) handleFileChange(files[0]) }} onClick={(e) => e.stopPropagation()} className="hidden" />
            <div className="w-9 h-9 rounded-full bg-[#f4e6fc] text-[#b63add] flex items-center justify-center text-lg font-bold mb-1.5">+</div>
            <p className="text-xs font-semibold text-[#b63add]">Drop your image here</p>
            <p className="text-[10px] text-[#9681ab] mt-0.5">Supports PNG, JPG, WEBP</p>
          </label>
        )}
      </div>

      {/* Title & Description — horizontal center only */}
      <div className="flex flex-col items-center text-center px-1">
        <h4 className="text-base font-bold text-[#1f0c33] line-clamp-2 leading-tight mb-1">
          {item.name || 'Untitled Memory'}
        </h4>
        {memoryDate && (
          <span className="text-[10px] font-medium text-[#b63add] mb-1">Date: {memoryDate}</span>
        )}
        <p className="text-[11px] text-[#624d78] leading-relaxed ">
          {item.description || 'No notes added for this memory moment yet.'}
        </p>
      </div>

      {/* Footer: order + page number */}
      <div className="border-t border-[#f0e6fa] pt-2 flex items-center justify-between flex-shrink-0 mt-auto">
        <span className="text-[10px] font-semibold text-[#b63add] bg-[#f4e6fc] px-2 py-0.5 rounded-full">
          {item.order != null ? `Order: #${item.order}` : 'No order'}
        </span>
        <span className="text-[10px] font-medium text-[#9681ab]">{pageNum}</span>
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

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<CollectionItem | null>(null)



  const maxPages = useMemo(() => {
    // 1 Front Cover + items count + 1 Back Cover
    return Math.max(1, items.length + 2)
  }, [items])


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

  return (
    <>
      <div key="memory-book-modal-wrapper" className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
        {/* Dimmed Background Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
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
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#b63add] block">
                Memory Book
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white line-clamp-1">
                {collection.name || 'Untitled Collection'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Create Memory Button */}
              <button
                type="button"
                onClick={handleCreateMemoryClick}
                className="px-4 py-2 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white text-xs font-semibold shadow-lg shadow-[#b63add]/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>+</span>
                <span>Create Memory</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* FlipBook Container for 2-Page Spread */}
          <div className="relative shadow-2xl rounded-2xl overflow-hidden p-2 sm:p-4 bg-gradient-to-r from-[#b63add]/30 via-transparent to-[#b63add]/30 max-w-full">
            <HTMLFlipBook
              key={bookFlipKey}
              ref={flipBookRef}
              width={450}
              height={600}
              size="fixed"
              minWidth={320}
              maxWidth={500}
              minHeight={500}
              maxHeight={650}
              maxShadowOpacity={0.5}
              showCover={true}
              usePortrait={false}
              mobileScrollSupport={false}
              useMouseEvents={false}
              clickEventForward={false}
              showPageCorners={false}
              swipeDistance={0}
              onFlip={onPageFlip}
              className="mx-auto rounded-lg"
            >
              {/* PAGE 1: Front Cover */}
              <BookPage key="page-front-cover" className="!bg-gradient-to-br !from-[#b63add] !to-[#8b22b3] !text-white border-2 border-white/20">
                <div className="h-full flex flex-col justify-between items-center text-center p-4">
                  <div className="w-full border-b border-white/20 pb-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/80">
                      Valentine Memory Book
                    </span>
                  </div>

                  <div className="my-auto flex flex-col items-center max-w-xs">
                    {posterUrl && (
                      <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg mb-4">
                        <img
                          src={posterUrl}
                          alt="Collection Cover"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                      {collection.name || 'Untitled Collection'}
                    </h2>
                    <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
                      {collection.description || 'A cherished collection of romantic memories.'}
                    </p>
                  </div>

                  <div className="w-full border-t border-white/20 pt-3">
                    <span className="text-[11px] font-semibold text-white/90">
                      Use Navigation Controls Below To Flip
                    </span>
                  </div>
                </div>
              </BookPage>

              {/* Inner Item Pages */}
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <BookPage key={`item-page-${item.id && item.id.trim() !== '' ? item.id : 'idx-' + idx}`}>
                    <ItemPageContent
                      item={item}
                      pageNum={idx + 1}
                      onEditItem={handleEditItemClick}
                      onDeleteItem={handleDeleteItemClick}
                      onImageChanged={handleImageChanged}
                    />
                  </BookPage>
                ))
              ) : (
                <BookPage key="page-empty-collection">
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <h4 className="text-base font-bold text-[#1f0c33] mb-2">
                      Empty Collection
                    </h4>
                    <p className="text-xs text-[#624d78] mb-4">
                      No memory items added to this collection yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateMemoryClick}
                      className="px-4 py-2 rounded-xl bg-[#b63add] text-white text-xs font-semibold shadow cursor-pointer"
                    >
                      + Add First Memory
                    </button>
                  </div>
                </BookPage>
              )}

              {/* FINAL PAGE: Back Cover */}
              <BookPage key="page-back-cover" className="!bg-[#1f0c33] !text-white border-2 border-[#b63add]/30">
                <div className="h-full flex flex-col justify-between items-center text-center p-6">
                  <div className="w-full border-b border-white/10 pb-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#b63add]">
                      The End
                    </span>
                  </div>

                  <div className="my-auto">
                    <h3 className="text-xl font-bold text-[#1f0c33] mb-2">
                      Memories To Be Continued
                    </h3>
                    <p className="text-xs text-gray-400">
                      ValentineBook Memory Vault
                    </p>
                  </div>

                  <div className="w-full border-t border-white/10 pt-3">
                    <span className="text-[10px] text-gray-500">
                      Created with love
                    </span>
                  </div>
                </div>
              </BookPage>
            </HTMLFlipBook>
          </div>

          {/* Bottom Navigation Controls & Page Number Input */}
          <div className="flex items-center gap-4 mt-5">
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              Previous Page
            </button>

            {/* Interactive Page Input Navigation */}
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white">
              <span className="text-gray-300 font-medium">Page</span>
              <input
                type="number"
                min={1}
                max={maxPages}
                value={pageInput}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                className="w-12 bg-white/20 text-center font-bold text-white rounded px-1 py-0.5 outline-none border border-white/30 focus:border-[#b63add]"
              />
              <span className="text-gray-300 font-medium">/ {maxPages}</span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white text-xs font-semibold shadow-lg shadow-[#b63add]/30 transition-all cursor-pointer"
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
