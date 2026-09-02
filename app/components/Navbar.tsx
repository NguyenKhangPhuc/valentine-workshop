'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function Navbar() {
  const [activeSection, setActiveSection] = useState<'home' | 'collections'>('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setScrolled(scrollY > 60)

      const collectionsEl = document.getElementById('collections')
      if (collectionsEl) {
        const rect = collectionsEl.getBoundingClientRect()
        setActiveSection(rect.top <= 200 ? 'collections' : 'home')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' as const }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center py-4 pointer-events-none"
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-full border transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(255,255,255,0.12)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          borderColor: scrolled ? 'rgba(255,255,255,0.2)' : 'transparent',
          boxShadow: scrolled ? '0 4px 24px rgba(182,58,221,0.12)' : 'none',
        }}
      >
        <Link
          href="#home"
          onClick={() => setActiveSection('home')}
          className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeSection === 'home'
              ? 'text-[#b63add] bg-white shadow-sm'
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}
        >
          Home
        </Link>

        <Link
          href="#collections"
          onClick={() => setActiveSection('collections')}
          className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            activeSection === 'collections'
              ? 'text-[#b63add] bg-white shadow-sm'
              : 'text-white/90 hover:text-white hover:bg-white/10'
          }`}
        >
          Collections
        </Link>
      </nav>
    </motion.header>
  )
}
