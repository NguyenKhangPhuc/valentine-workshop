'use client'

import React from 'react'

export type SortOption =
  | 'created_at_desc'
  | 'created_at_asc'
  | 'name_asc'
  | 'name_desc'
  | 'items_desc'
  | 'items_asc'
  | 'start_date_asc'
  | 'start_date_desc'

interface CollectionToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  totalFiltered: number
  totalCount: number
  onReset: () => void
}

export function CollectionToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalFiltered,
  totalCount,
  onReset,
}: CollectionToolbarProps) {
  const isFiltered = searchQuery.trim() !== '' || sortBy !== 'created_at_desc'

  return (
    <div className="w-full mb-8 bg-white border border-[#e9dcf5] rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9681ab]">
            {/* Search Glass Icon */}
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search collections by title or description..."
            aria-label="Search collections"
            className="w-full pl-10 pr-10 py-2.5 bg-[#fcfbfe] border border-[#e9dcf5] hover:border-[#b63add]/40 focus:border-[#b63add] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b63add]/20 rounded-xl text-sm text-[#1f0c33] placeholder-[#9681ab] transition-all"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9681ab] hover:text-[#b63add] cursor-pointer transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort & Filter Dropdown */}
        <div className="relative flex-1 sm:flex-initial sm:min-w-[240px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9681ab]">
            {/* Sort Arrows Icon */}
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
                d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </span>

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            aria-label="Sort collections by criteria"
            className="w-full pl-10 pr-9 py-2.5 bg-[#fcfbfe] border border-[#e9dcf5] hover:border-[#b63add]/40 focus:border-[#b63add] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b63add]/20 rounded-xl text-sm text-[#1f0c33] font-medium appearance-none transition-all cursor-pointer"
          >
            <optgroup label="Created Date" className="font-bold text-[#b63add] bg-white not-italic">
              <option value="created_at_desc" className="font-normal text-[#1f0c33] bg-white">
                Created: Newest &rarr; Oldest
              </option>
              <option value="created_at_asc" className="font-normal text-[#1f0c33] bg-white">
                Created: Oldest &rarr; Newest
              </option>
            </optgroup>
            <optgroup label="Start Date" className="font-bold text-[#b63add] bg-white not-italic">
              <option value="start_date_desc" className="font-normal text-[#1f0c33] bg-white">
                Start Date: Newest &rarr; Oldest
              </option>
              <option value="start_date_asc" className="font-normal text-[#1f0c33] bg-white">
                Start Date: Oldest &rarr; Newest
              </option>
            </optgroup>
            <optgroup label="Title" className="font-bold text-[#b63add] bg-white not-italic">
              <option value="name_asc" className="font-normal text-[#1f0c33] bg-white">
                Title: A &rarr; Z
              </option>
              <option value="name_desc" className="font-normal text-[#1f0c33] bg-white">
                Title: Z &rarr; A
              </option>
            </optgroup>
            <optgroup label="Memories Count" className="font-bold text-[#b63add] bg-white not-italic">
              <option value="items_desc" className="font-normal text-[#1f0c33] bg-white">
                Memories: Most &rarr; Least
              </option>
              <option value="items_asc" className="font-normal text-[#1f0c33] bg-white">
                Memories: Least &rarr; Most
              </option>
            </optgroup>
          </select>

          {/* Select Dropdown Chevron */}
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#9681ab]">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
      </div>

      {/* Active Filter Indicators and Result Counter */}
      {isFiltered && (
        <div className="mt-3.5 pt-3 border-t border-[#f0e6fa] flex flex-wrap items-center justify-between gap-2 text-xs text-[#624d78]">
          <div className="flex items-center flex-wrap gap-2">
            <span>
              Showing <strong className="text-[#1f0c33] font-semibold">{totalFiltered}</strong> of{' '}
              <strong className="text-[#1f0c33] font-semibold">{totalCount}</strong> collections
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#faf0fe] text-[#b63add] border border-[#e9dcf5] font-medium">
                <span>Keyword: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Remove keyword"
                  className="hover:text-[#9c28bd] cursor-pointer ml-0.5"
                >
                  &times;
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onReset}
            className="text-[#b63add] hover:text-[#9c28bd] font-semibold hover:underline cursor-pointer transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}
