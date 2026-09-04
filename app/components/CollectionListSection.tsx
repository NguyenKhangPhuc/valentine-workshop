'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { CollectionCard } from './CollectionCard'
import { CreateCollectionModal } from './CreateCollectionModal'
import { EditCollectionModal } from './EditCollectionModal'
import { MemoryBookModal } from './MemoryBookModal'
import { deleteCollection } from '../actions/collection'

interface CollectionListSectionProps {
  initialCollections: CollectionWithItems[]
}

const fallbackCollections: CollectionWithItems[] = [
  {
    id: 'sample-1',
    name: 'Valentine Trip in Lapland',
    description: 'Beautiful romantic trip memories amidst northern lights and snow.',
    poster_url: '/zng_bg.png',
    start_time: '2026-02-14',
    end_time: '2026-02-20',
    created_at: new Date().toISOString(),
    collection_items: [
      {
        id: 'item-1',
        collection_id: 'sample-1',
        name: 'Northern Lights Evening',
        description: 'Watching magical green aurora lights together in the quiet night sky.',
        image_url: '/zng_bg.png',
        memory_date: '2026-02-14',
        order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-2',
        collection_id: 'sample-1',
        name: 'Cosy Fireside Hot Chocolate',
        description: 'Warm moments inside a wooden cabin listening to snowfall.',
        image_url: null,
        memory_date: '2026-02-15',
        order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'item-3',
        collection_id: 'sample-1',
        name: 'Reindeer Sleigh Ride',
        description: 'Gliding peacefully through snowy pine forests together.',
        image_url: '/zng_bg.png',
        memory_date: '2026-02-16',
        order: 3,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'sample-2',
    name: 'Anniversary Dinner Date',
    description: 'Candlelight dinner at a cosy bistro celebrating our love journey.',
    poster_url: null,
    start_time: '2025-10-10',
    end_time: '2025-10-10',
    created_at: new Date().toISOString(),
    collection_items: [
      {
        id: 'item-21',
        collection_id: 'sample-2',
        name: 'Candlelight Toast',
        description: 'Cheers to another wonderful year filled with love and laughter.',
        image_url: null,
        memory_date: '2025-10-10',
        order: 1,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'sample-3',
    name: 'Spring Blossom Walk',
    description: 'Walking hand in hand through blooming cherry blossom parks.',
    poster_url: '/zng_bg.png',
    start_time: '2025-04-20',
    end_time: '2025-04-25',
    created_at: new Date().toISOString(),
    collection_items: [],
  },
  {
    id: 'sample-4',
    name: 'Sunset Beach Picnic',
    description: 'Golden hour waves, ocean breeze, and sweet conversation.',
    poster_url: null,
    start_time: '2025-07-08',
    end_time: '2025-07-08',
    created_at: new Date().toISOString(),
    collection_items: [],
  },
]

export function CollectionListSection({ initialCollections }: CollectionListSectionProps) {
  const [collections, setCollections] = useState<CollectionWithItems[]>(initialCollections)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeViewCollection, setActiveViewCollection] = useState<CollectionWithItems | null>(null)
  const [activeEditCollection, setActiveEditCollection] = useState<CollectionWithItems | null>(null)

  const handleDeleteCollection = async (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      const res = await deleteCollection(collectionId)
      if (res?.error) {
        console.warn('DB delete error, removing from local state:', res.error)
      }
      setCollections((prev) => prev.filter((col) => col.id !== collectionId))
    }
  }

  const handleUpdateCollectionItems = (updatedItems: any[]) => {
    if (activeViewCollection) {
      const updated = { ...activeViewCollection, collection_items: updatedItems }
      setActiveViewCollection(updated)
      setCollections((prev) =>
        prev.map((col) => (col.id === updated.id ? updated : col))
      )
    }
  }

  const handleCollectionCreated = (newCollection: CollectionWithItems) => {
    setCollections((prev) => [newCollection, ...prev])
  }

  const handleCollectionEdited = (updatedCollection: CollectionWithItems) => {
    setCollections((prev) =>
      prev.map((col) => (col.id === updatedCollection.id ? { ...col, ...updatedCollection } : col))
    )
  }

  return (
    <section id="collections" className="w-full py-16 md:py-24 bg-[#fcfbfe] text-[#1f0c33] relative z-20">
      {/* Container - Not too tight/narrow padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-[#e9dcf5]">
          <div>
            <span className="text-[#b63add] text-xs font-bold uppercase tracking-widest block mb-1">
              Memory Albums
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1f0c33] flex items-center gap-2">
              <span>Your Collections</span>
              <span className="text-[#b63add] text-2xl font-normal">({collections.length})</span>
            </h2>
          </div>

          {/* Create Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white font-semibold text-sm transition-all shadow-lg shadow-[#b63add]/25 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>Create Collection</span>
          </motion.button>
        </div>

        {/* 4 Collections per row Grid Layout */}
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collections.map((collection) => (
              <div key={collection.id}>
                <CollectionCard
                  collection={collection}
                  onView={(col) => setActiveViewCollection(col)}
                  onEdit={(col) => setActiveEditCollection(col)}
                  onDelete={handleDeleteCollection}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-6 bg-white border border-dashed border-[#e9dcf5] rounded-3xl max-w-lg mx-auto shadow-sm"
          >
            <h3 className="text-xl font-bold text-[#1f0c33] mb-2">No Collections Yet</h3>
            <p className="text-sm text-[#624d78] mb-6">
              Start building your digital Valentine memory book by creating your first memory collection!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white font-semibold text-sm transition-all shadow-md shadow-[#b63add]/30 cursor-pointer"
            >
              + Create First Collection
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCollectionCreated}
      />

      {/* Edit Collection Modal */}
      {activeEditCollection &&
        <EditCollectionModal
          isOpen={!!activeEditCollection}
          onClose={() => setActiveEditCollection(null)}
          collection={activeEditCollection}
          onSuccess={handleCollectionEdited}
        />}

      {/* Memory Book FlipBook Modal */}
      {activeViewCollection && <MemoryBookModal
        collection={activeViewCollection}
        isOpen={!!activeViewCollection}
        onClose={() => setActiveViewCollection(null)}
        onUpdateCollectionItems={handleUpdateCollectionItems}
      />}
    </section>
  )
}
