'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface Heart {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  rotation: number
  rotationSpeed: number
  wobble: number
  wobbleSpeed: number
  wobbleOffset: number
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save()
  ctx.beginPath()
  const s = size / 10
  ctx.moveTo(x, y + s * 3)
  ctx.bezierCurveTo(x, y + s * 2, x - s * 1.5, y, x - s * 3, y)
  ctx.bezierCurveTo(x - s * 5, y, x - s * 5, y + s * 3.5, x - s * 5, y + s * 3.5)
  ctx.bezierCurveTo(x - s * 5, y + s * 5.5, x - s * 3, y + s * 7, x, y + s * 9.5)
  ctx.bezierCurveTo(x + s * 3, y + s * 7, x + s * 5, y + s * 5.5, x + s * 5, y + s * 3.5)
  ctx.bezierCurveTo(x + s * 5, y + s * 3.5, x + s * 5, y, x + s * 3, y)
  ctx.bezierCurveTo(x + s * 1.5, y, x, y + s * 2, x, y + s * 3)
  ctx.closePath()
  ctx.restore()
}

function createHeart(canvasWidth: number, canvasHeight: number): Heart {
  const size = Math.random() * 20 + 8
  return {
    x: Math.random() * (canvasWidth + 100) - 50,
    y: -size * 2 - Math.random() * canvasHeight,
    size,
    speed: Math.random() * 1.5 + 0.8,
    opacity: Math.random() * 0.5 + 0.15,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    wobble: 0,
    wobbleSpeed: Math.random() * 0.03 + 0.01,
    wobbleOffset: Math.random() * Math.PI * 2,
  }
}

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heartsRef = useRef<Heart[]>([])
  const animFrameRef = useRef<number>(0)
  const tickRef = useRef<number>(0)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    const resize = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height

      // Maintain 70 hearts
      const count = Math.floor((width * height) / 14000)
      heartsRef.current = Array.from({ length: Math.max(count, 40) }, () =>
        createHeart(width, height)
      )
      // Spread hearts across full screen initially (not all at top)
      heartsRef.current = heartsRef.current.map((h, i) => ({
        ...h,
        y: i < heartsRef.current.length * 0.6 ? Math.random() * height : h.y,
      }))
    }

    const animate = () => {
      tickRef.current += 1
      ctx.clearRect(0, 0, width, height)

      heartsRef.current.forEach((heart) => {
        heart.y += heart.speed
        heart.rotation += heart.rotationSpeed
        heart.wobble = tickRef.current * heart.wobbleSpeed + heart.wobbleOffset
        const wobbleX = heart.x + Math.sin(heart.wobble) * 18

        if (heart.y > height + heart.size * 3) {
          // Reset to top
          const fresh = createHeart(width, height)
          Object.assign(heart, fresh)
        }

        ctx.save()
        ctx.globalAlpha = heart.opacity
        ctx.translate(wobbleX, heart.y)
        ctx.rotate(heart.rotation)
        ctx.fillStyle = '#ffffff'
        drawHeart(ctx, 0, 0, heart.size)
        ctx.fill()
        ctx.restore()
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    resize()
    animate()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #c040ef 0%, #b63add 40%, #8b22b3 100%)' }}
    >
      {/* Falling Hearts Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Bottom gradient fade into white background */}
      <div className="absolute inset-x-0 bottom-0 h-40 z-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Hero Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* Main Title: MemoryBook */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none mb-10 text-white drop-shadow-2xl"
        >
          Memory<span
            className="inline-block ml-1 px-3 py-1 rounded-xl text-[#b63add]"
            style={{ background: 'rgba(255,255,255,0.97)' }}
          >Book</span>
        </motion.h1>

        {/* Explore Button — rounded-xl (squarer) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <a
            href="#collections"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-[#b63add] font-bold text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.97)' }}
          >
            <span>Explore Collections</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-white/70 text-xs flex flex-col items-center gap-1.5 font-medium"
      >
        <span className="tracking-widest uppercase text-[10px]">Scroll</span>
        <div className="w-5 h-8 rounded-full border-2 border-white/40 flex justify-center pt-1.5 backdrop-blur-sm">
          <div className="w-1.5 h-2 bg-white rounded-full animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}
