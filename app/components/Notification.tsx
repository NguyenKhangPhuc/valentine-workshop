/**
 * PURPOSE:
 * Renders the global notification popup toast at the bottom right.
 * Uses Framer Motion's AnimatePresence to slide in from left to right on entry
 * and fade out on exit.
 *
 * CONTEXT/PARENT FILE:
 * Mounted globally in root layout wrappers to display success or failure alerts.
 *
 * INPUTS / PARAMETERS:
 * None (reads global state via useNotification context hook).
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../context/NotificationContext'

export const NotificationCard = () => {
  const { notification, setNotification } = useNotification()

  return (
    <AnimatePresence>
      {notification.isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-[100] pointer-events-none"
        >
          <div className="bg-white/95 backdrop-blur-md border border-[#e9dcf5] shadow-xl shadow-[#b63add]/10 rounded-xl p-4 flex items-center justify-between gap-3.5 max-w-sm pointer-events-auto relative overflow-hidden select-none">
            {/* Left vertical accent line styled with theme brand gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#b63add] to-[#d946ef]" />

            {/* Left Icon with subtle theme brand background */}
            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-[#faf0fe] border border-[#e9dcf5] text-[#b63add]">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </div>

            {/* Alert Content */}
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
              <span className="font-sans text-[10px] font-bold text-[#b63add] uppercase tracking-wider leading-none">
                NOTIFICATION
              </span>
              <p className="font-sans text-xs text-[#1f0c33] font-medium leading-relaxed break-words select-text">
                {notification.content || 'Operational parameters updated.'}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => setNotification({ ...notification, isOpen: false })}
              type="button"
              aria-label="Close notification"
              className="flex shrink-0 items-center justify-center w-6 h-6 rounded-lg border border-transparent hover:border-[#e9dcf5] bg-transparent hover:bg-[#faf0fe] text-[#9681ab] hover:text-[#b63add] transition-all cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationCard
