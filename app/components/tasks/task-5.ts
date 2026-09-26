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
  /**
   * --------------------------------------------------------------------------
   * Step 1: Validate input and handle empty collections
   * --------------------------------------------------------------------------
   * Specification:
   * - Guard against empty, null, or undefined collection arrays.
   * - Immediately return an empty array `[]` to avoid runtime evaluation errors.
   */
  // Check if collection array is empty or undefined.
  if (!collections || collections.length === 0) {
    // Return an empty array immediately when no collections exist.
    return []
  }

  /**
   * --------------------------------------------------------------------------
   * Step 2: Sanitize and normalize search query
   * --------------------------------------------------------------------------
   * Specification:
   * - Strip leading and trailing whitespace using `.trim()`.
   * - Convert query string to lowercase for case-insensitive matching.
   * - Fast-path exit: return the unfiltered `collections` array if query is empty.
   */
  // Trim whitespace and convert query to lowercase for case-insensitive matching.
  const normalizedQuery = (query || '').trim().toLowerCase()

  // Check if the normalized query is empty.
  if (normalizedQuery === '') {
    // Return the original collection array directly if no search keyword is given.
    return collections
  }

  /**
   * --------------------------------------------------------------------------
   * Step 3: Filter collections using case-insensitive substring matching
   * --------------------------------------------------------------------------
   * Specification:
   * - Iterate across collection entries using `Array.prototype.filter`.
   * - Check if `collection.name` contains `normalizedQuery`.
   * - Check if `collection.description` contains `normalizedQuery`.
   * - Return only collections satisfying at least one match condition.
   */
  // TODO: Filter collections array based on matching title or description against normalizedQuery.
  return []
}
