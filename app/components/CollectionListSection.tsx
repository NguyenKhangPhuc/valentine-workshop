'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CollectionWithItems } from '../types/collection'
import { CollectionCard } from './CollectionCard'
import { CreateCollectionModal } from './CreateCollectionModal'

interface CollectionListSectionProps {
  initialCollections: CollectionWithItems[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export function CollectionListSection({ initialCollections }: CollectionListSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const collections = initialCollections || []

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
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white font-semibold text-sm transition-all shadow-lg shadow-[#b63add]/25 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>Create Collection</span>
          </motion.button>
        </div>

        {/* 4 Collections per row Grid Layout */}
        {collections.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {collections.map((collection) => (
              <motion.div key={collection.id} variants={itemVariants}>
                <CollectionCard collection={collection} />
              </motion.div>
            ))}
          </motion.div>
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
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-[#b63add] hover:bg-[#9c28bd] text-white font-semibold text-sm transition-all shadow-md shadow-[#b63add]/30"
            >
              + Create First Collection
            </button>
          </motion.div>
        )}
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  )
}
