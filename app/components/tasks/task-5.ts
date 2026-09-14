/**
 * ============================================================================
 * Task 5: Search Collections by Title or Description
 * ============================================================================
 *
 * @file task-5.ts
 * @module components/tasks/task-5
 *
 * @description
 * This task provides a pure filtering utility that searches an array of collections
 * by matching a user's search query against collection titles (`name`) and `description`
 * text in a case-insensitive manner.
 *
 * @usedBy
 * - `CollectionListSection.tsx` (`app/components/CollectionListSection.tsx`)
 *   Used inside the `useMemo` filter pipeline whenever the user types into the
 *   search bar in `CollectionToolbar`.
 */

import { CollectionWithItems } from '../../types/collection'

/**
 * Filters a list of collections matching a query string in either their title (`name`)
 * or their `description`.
 *
 * @param {CollectionWithItems[]} collections - The source array of collections to search through.
 * @param {string} query - The search string entered by the user.
 * @returns {CollectionWithItems[]} A new array containing only the matching collections.
 *
 * @example
 * ```ts
 * const allCollections = [...];
 * const results = searchByTitleOrDescription(allCollections, "Lapland");
 * console.log(`Found ${results.length} matches`);
 * ```
 */
export function searchByTitleOrDescription(
  collections: CollectionWithItems[],
  query: string
): CollectionWithItems[] {
  // --------------------------------------------------------------------------
  // Step 1: Handle edge cases and empty source arrays
  // --------------------------------------------------------------------------
  // If the array is empty or undefined, return an empty array immediately.
  if (!collections || collections.length === 0) {
    return []
  }

  // --------------------------------------------------------------------------
  // Step 2: Sanitize and normalize the search query
  // --------------------------------------------------------------------------
  // Trim unnecessary leading/trailing whitespace and convert to lowercase for
  // case-insensitive comparison.
  const normalizedQuery = (query || '').trim().toLowerCase()

  // --------------------------------------------------------------------------
  // Step 3: Fast-exit optimization for blank searches
  // --------------------------------------------------------------------------
  // If the search term is empty (e.g., user cleared the search box),
  // return the original collection array without filtering overhead.
  if (normalizedQuery === '') {
    return collections
  }

  // --------------------------------------------------------------------------
  // Step 4: Filter collections using safe substring inclusion
  // --------------------------------------------------------------------------
  // Iterate through each collection and check if either the name or description matches.
  return collections.filter((collection) => {
    // Safely check if the collection's name contains the search term
    const nameMatch = collection.name
      ? collection.name.toLowerCase().includes(normalizedQuery)
      : false

    // Safely check if the collection's description contains the search term
    const descriptionMatch = collection.description
      ? collection.description.toLowerCase().includes(normalizedQuery)
      : false

    // Include the collection if either the title or description matched
    return nameMatch || descriptionMatch
  })
}
