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
  /**
   * --------------------------------------------------------------------------
   * Step 1: Update active sort criteria state
   * --------------------------------------------------------------------------
   * Specification:
   * - Invoke `setSortBy(newSort)` to notify React of the newly selected sorting mode.
   */
  // Update state with the newly selected sorting option.
  setSortBy(newSort)

  /**
   * --------------------------------------------------------------------------
   * Step 2: Reset pagination to initial page
   * --------------------------------------------------------------------------
   * Specification:
   * - Call `setCurrentPage(1)` to return view to page 1, preventing stranded empty pages.
   */
  // Reset pagination back to page 1 to prevent empty pages on re-sort.
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
  /**
   * --------------------------------------------------------------------------
   * Step 1: Handle trivial cases and create immutable shallow copy
   * --------------------------------------------------------------------------
   * Specification:
   * - If `collections` has 1 or 0 elements, return it immediately to avoid overhead.
   * - Create a shallow copy `[...collections]` to guarantee immutability and protect props.
   */
  // Check if collections list has 1 or fewer items to skip sorting.
  if (!collections || collections.length <= 1) {
    // Return original array or empty array if null/undefined.
    return collections || []
  }

  // Create shallow copy of array to maintain immutability and avoid mutating props.
  const sorted = [...collections]

  /**
   * --------------------------------------------------------------------------
   * Step 2: Execute sorting comparator based on selected option
   * --------------------------------------------------------------------------
   * Specification:
   * - In-place sort the cloned array using `Array.prototype.sort`.
   * - Branch across 8 sorting modes via `switch (sortBy)`:
   *   * `created_at_desc` / `created_at_asc`: Numerical comparison on timestamp epochs.
   *   * `name_asc` / `name_desc`: String locale comparison via `String.prototype.localeCompare`.
   *   * `items_desc` / `items_asc`: Difference comparison on `collection_items.length`.
   *   * `start_date_asc` / `start_date_desc`: Date comparisons with missing-date sink logic.
   *   * `default`: Preserve original order (return 0).
   */
  // Sort array in-place using comparator based on active sort option.
  sorted.sort((a, b) => {
    // Determine comparator logic corresponding to selected sortBy option.
    switch (sortBy) {
      // Sort collections by newest creation timestamp first.
      case 'created_at_desc': {
        // Parse creation date of collection A into epoch milliseconds.
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        // Parse creation date of collection B into epoch milliseconds.
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        // Calculate descending difference so newer dates appear first.
        return timeB - timeA
      }

      // Sort collections by oldest creation timestamp first.
      case 'created_at_asc': {
        // Parse creation date of collection A into epoch milliseconds.
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        // Parse creation date of collection B into epoch milliseconds.
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        // Calculate ascending difference so older dates appear first.
        return timeA - timeB
      }

      // Sort collections alphabetically by name from A to Z.
      case 'name_asc': {
        // Retrieve name of collection A or empty string fallback.
        const nameA = a.name || ''
        // Retrieve name of collection B or empty string fallback.
        const nameB = b.name || ''
        // Compare names in ascending alphabetical order.
        return nameA.localeCompare(nameB)
      }

      // Sort collections alphabetically by name from Z to A.
      case 'name_desc': {
        // Retrieve name of collection A or empty string fallback.
        const nameA = a.name || ''
        // Retrieve name of collection B or empty string fallback.
        const nameB = b.name || ''
        // Compare names in descending alphabetical order.
        return nameB.localeCompare(nameA)
      }

      // Sort collections by memory count in descending order.
      case 'items_desc': {
        // Count number of memory items in collection A.
        const countA = a.collection_items?.length || 0
        // Count number of memory items in collection B.
        const countB = b.collection_items?.length || 0
        // Return descending difference so collections with most items appear first.
        return countB - countA
      }

      // Sort collections by memory count in ascending order.
      case 'items_asc': {
        // Count number of memory items in collection A.
        const countA = a.collection_items?.length || 0
        // Count number of memory items in collection B.
        const countB = b.collection_items?.length || 0
        // Return ascending difference so collections with fewest items appear first.
        return countA - countB
      }

      // Sort collections by event start date in ascending order (earliest first).
      case 'start_date_asc': {
        // Keep order if both collections have no start date.
        if (!a.start_time && !b.start_time) return 0
        // Place collection without start date after collection with date.
        if (!a.start_time) return 1
        // Place collection with start date before collection without date.
        if (!b.start_time) return -1
        // Compare start timestamps in ascending order.
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      }

      // Sort collections by event start date in descending order (latest first).
      case 'start_date_desc': {
        // Keep order if both collections have no start date.
        if (!a.start_time && !b.start_time) return 0
        // Place collection without start date after collection with date.
        if (!a.start_time) return 1
        // Place collection with start date before collection without date.
        if (!b.start_time) return -1
        // Compare start timestamps in descending order.
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      }

      // Return 0 as default to preserve original order for unrecognized sort keys.
      default:
        return 0
    }
  })

  /**
   * --------------------------------------------------------------------------
   * Step 3: Return sorted collections array
   * --------------------------------------------------------------------------
   * Specification:
   * - Return the newly ordered array without modifying the source collection.
   */
  // Return the newly sorted array of collections.
  return sorted
}
