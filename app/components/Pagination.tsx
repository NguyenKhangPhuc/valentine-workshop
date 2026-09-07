'use client'

import React from 'react'

/**
 * PURPOSE:
 * A generic and reusable client-side Pagination component. It displays pagination controls
 * with padded two-digit page numbers (e.g., "01", "02") and handles intermediate ellipsis
 * for scaling page counts.
 *
 * CONTEXT/PARENT FILE:
 * Extracted into a shared helper folder to allow other views (like Events, Projects, or Search)
 * to reuse the same pagination element and maintain visual design consistency.
 *
 * INPUTS / PARAMETERS:
 * - currentPage (number, Required): The current active page number (1-indexed).
 * - totalPages (number, Required): The total number of pages available.
 * - onPageChange ((page: number) => void, Required): Callback invoked when a user clicks a page number or arrow.
 * - className (string, Optional): Additional class names for container layout.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}) {
  if (totalPages <= 1) return null

  /**
   * BEHAVIORAL MECHANISM:
   * Pads numbers to two digits (e.g. 1 becomes "01") to match the technical console typography.
   *
   * PARAMETERS:
   * - num (number): The page number.
   *
   * RETURNS:
   * - string: Two-character padded representation of the number.
   */
  const formatPageNumber = (num: number): string => {
    return String(num).padStart(2, '0')
  }

  /**
   * BEHAVIORAL MECHANISM:
   * Computes the visible page numbers, including first, last, current, and surrounding pages,
   * injecting null/ellipses where pages are skipped.
   *
   * PARAMETERS:
   * None.
   *
   * RETURNS:
   * - Array<number | string>: An array of visible page numbers or string indicators (ellipses).
   */
  const getVisiblePages = (): Array<number | string> => {
    const range: Array<number | string> = []
    const delta = 1 // Numbers to show before and after current page

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      } else if (range[range.length - 1] !== '...') {
        range.push('...')
      }
    }
    return range
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={`flex items-center justify-start gap-2 mt-8 select-none ${className}`}>
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-8 h-8 flex items-center justify-center border border-[#e9dcf5] bg-white text-[#624d78] disabled:opacity-30 disabled:pointer-events-none hover:text-[#b63add] hover:border-[#b63add]/40 hover:bg-[#faf0fe] rounded-lg font-mono text-xs transition-all duration-200 cursor-pointer"
      >
        &lt;
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="w-8 h-8 flex items-center justify-center text-[#9681ab] font-mono text-xs"
            >
              ...
            </span>
          )
        }

        const isCurrent = page === currentPage
        return (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => onPageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={isCurrent ? 'page' : undefined}
            className={`w-8 h-8 flex items-center justify-center font-mono text-xs rounded-lg transition-all duration-200 cursor-pointer ${
              isCurrent
                ? 'border border-[#b63add] text-[#b63add] bg-[#b63add]/10 font-bold shadow-xs'
                : 'border border-[#e9dcf5] bg-white text-[#624d78] hover:text-[#b63add] hover:border-[#b63add]/40 hover:bg-[#faf0fe]'
            }`}
          >
            {formatPageNumber(page as number)}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-8 h-8 flex items-center justify-center border border-[#e9dcf5] bg-white text-[#624d78] disabled:opacity-30 disabled:pointer-events-none hover:text-[#b63add] hover:border-[#b63add]/40 hover:bg-[#faf0fe] rounded-lg font-mono text-xs transition-all duration-200 cursor-pointer"
      >
        &gt;
      </button>
    </div>
  )
}
