'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { colorManagement } from './tasks/color-management'

export function Navbar() {
  const [activeSection, setActiveSection] = useState<'home' | 'collections'>('home')
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
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

  const getItemStyle = (section: 'home' | 'collections') => {
    const isActive = activeSection === section
    if (isActive) {
      return {
        color: colorManagement.navItem.activeTextColor,
        backgroundColor: colorManagement.navItem.activeBackgroundColor,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    }
    const isHovered = hoveredSection === section
    return {
      color: isHovered
        ? colorManagement.navItem.inactiveHoverTextColor
        : colorManagement.navItem.inactiveTextColor,
      backgroundColor: isHovered
        ? colorManagement.navItem.inactiveHoverBackgroundColor
        : 'transparent',
    }
  }

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
            ? colorManagement.navbar.scrolledBackground
            : colorManagement.navbar.unscrolledBackground,
          backdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(0px)',
          borderColor: scrolled
            ? colorManagement.navbar.scrolledBorderColor
            : colorManagement.navbar.unscrolledBorderColor,
          boxShadow: scrolled
            ? colorManagement.navbar.scrolledShadowColor
            : 'none',
        }}
      >
        <Link
          href="#home"
          onClick={() => setActiveSection('home')}
          onMouseEnter={() => setHoveredSection('home')}
          onMouseLeave={() => setHoveredSection(null)}
          className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          style={getItemStyle('home')}
        >
          Home
        </Link>

        <Link
          href="#collections"
          onClick={() => setActiveSection('collections')}
          onMouseEnter={() => setHoveredSection('collections')}
          onMouseLeave={() => setHoveredSection(null)}
          className="relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
          style={getItemStyle('collections')}
        >
          Collections
        </Link>
      </nav>
    </motion.header>
  )
}
