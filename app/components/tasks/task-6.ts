/**
 * ============================================================================
 * Task 6: Collection Sorting & Sort Change Handler
 * ============================================================================
 *
 * @file task-6.ts
 * @module components/tasks/task-6
 *
 * @description
 * This task manages sorting collections according to user-selected criteria.
 * It provides:
 * 1. `onSortChange`: An event handler that updates the active sort criteria and
 *    resets current pagination back to page 1.
 * 2. `sortCollections`: A pure, immutable sorting engine that sorts an array of
 *    collections by creation date, title, memory count, or start date.
 *
 * @usedBy
 * - `CollectionToolbar.tsx` (`app/components/CollectionToolbar.tsx`)
 * - `CollectionListSection.tsx` (`app/components/CollectionListSection.tsx`)
 *   Invoked when the user selects a sort option from the sorting dropdown menu.
 */

import { CollectionWithItems } from '../../types/collection'
import { SortOption } from '../CollectionToolbar'

/**
 * Handles a sort option change event: updates the sorting state and resets pagination.
 *
 * @param {SortOption} newSort - The newly selected sorting option value.
 * @param {(sort: SortOption) => void} setSortBy - State setter function for the active sort criteria.
 * @param {(page: number) => void} setCurrentPage - State setter function for the current page number.
 *
 * @example
 * ```ts
 * onSortChange('name_asc', setSortBy, setCurrentPage);
 * ```
 */
export function onSortChange(
  newSort: SortOption,
  setSortBy: (sort: SortOption) => void,
  setCurrentPage: (page: number) => void
): void {
  // --------------------------------------------------------------------------
  // Step 1: Update the sort state
  // --------------------------------------------------------------------------
  // Tell React which sort criterion is now active
  setSortBy(newSort)

  // --------------------------------------------------------------------------
  // Step 2: Reset pagination to the first page
  // --------------------------------------------------------------------------
  // Resetting to page 1 prevents being stranded on a non-existent page index
  // when re-ordering results.
  setCurrentPage(1)
}

/**
 * Pure function that returns a new array of collections sorted according to the chosen criterion.
 *
 * @param {CollectionWithItems[]} collections - The array of collections to sort.
 * @param {SortOption} sortBy - The criterion by which to order the collections.
 * @returns {CollectionWithItems[]} A new, sorted array of collections.
 *
 * @example
 * ```ts
 * const sorted = sortCollections(collections, 'items_desc');
 * ```
 */
export function sortCollections(
  collections: CollectionWithItems[],
  sortBy: SortOption
): CollectionWithItems[] {
  // --------------------------------------------------------------------------
  // Step 1: Return early for trivial cases
  // --------------------------------------------------------------------------
  if (!collections || collections.length <= 1) {
    return collections || []
  }

  // --------------------------------------------------------------------------
  // Step 2: Create a shallow copy for immutability
  // --------------------------------------------------------------------------
  // Do NOT mutate the original collections array directly!
  const sorted = [...collections]

  // --------------------------------------------------------------------------
  // Step 3: Execute sorting comparator based on the selected option
  // --------------------------------------------------------------------------
  sorted.sort((a, b) => {
    switch (sortBy) {
      // Sort by creation date: newest first
      case 'created_at_desc': {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeB - timeA
      }

      // Sort by creation date: oldest first
      case 'created_at_asc': {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeA - timeB
      }

      // Sort alphabetically: A to Z
      case 'name_asc': {
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameA.localeCompare(nameB)
      }

      // Sort alphabetically: Z to A
      case 'name_desc': {
        const nameA = a.name || ''
        const nameB = b.name || ''
        return nameB.localeCompare(nameA)
      }

      // Sort by number of memory moments: most memories first
      case 'items_desc': {
        const countA = a.collection_items?.length || 0
        const countB = b.collection_items?.length || 0
        return countB - countA
      }

      // Sort by number of memory moments: fewest memories first
      case 'items_asc': {
        const countA = a.collection_items?.length || 0
        const countB = b.collection_items?.length || 0
        return countA - countB
      }

      // Sort by trip/event start date: earliest first
      case 'start_date_asc': {
        // Handle items without a start date by placing them at the bottom
        if (!a.start_time && !b.start_time) return 0
        if (!a.start_time) return 1
        if (!b.start_time) return -1
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      }

      // Sort by trip/event start date: latest first
      case 'start_date_desc': {
        // Handle items without a start date by placing them at the bottom
        if (!a.start_time && !b.start_time) return 0
        if (!a.start_time) return 1
        if (!b.start_time) return -1
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      }

      // Fallback: Maintain original order if unrecognized sort option
      default:
        return 0
    }
  })

  // Return the newly ordered array
  return sorted
}
