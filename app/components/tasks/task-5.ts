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
  // Check if collection array is empty or undefined.
  if (!collections || collections.length === 0) {
    // Return an empty array immediately when no collections exist.
    return []
  }

  // Trim whitespace and convert query to lowercase for case-insensitive matching.
  const normalizedQuery = (query || '').trim().toLowerCase()

  // Check if the normalized query is empty.
  if (normalizedQuery === '') {
    // Return the original collection array directly if no search keyword is given.
    return collections
  }

  // Filter collections array based on matching title or description.
  return collections.filter((collection) => {
    // Check if collection name exists and contains search term.
    const nameMatch = collection.name
      ? collection.name.toLowerCase().includes(normalizedQuery)
      : false

    // Check if collection description exists and contains search term.
    const descriptionMatch = collection.description
      ? collection.description.toLowerCase().includes(normalizedQuery)
      : false

    // Keep collection in filtered results if name or description matches.
    return nameMatch || descriptionMatch
  })
}
