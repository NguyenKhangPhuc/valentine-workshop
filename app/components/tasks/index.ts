/**
 * ============================================================================
 * Valentine Memory Book Tutorial Tasks
 * ============================================================================
 *
 * @file index.ts
 * @module components/tasks
 *
 * @description
 * Barrel export module for all workshop tutorial tasks.
 * Learners can import any task function directly or components can consume
 * the centralized task implementations from this entry point.
 *
 * Tasks Overview:
 * - Task 1: `createCollection` (CreateCollectionModal.tsx)
 * - Task 2: `editCollection` (EditCollectionModal.tsx)
 * - Task 3: `createMemory` (CreateMemoryItemModal.tsx)
 * - Task 4: `editMemory` (EditMemoryItemModal.tsx)
 * - Task 5: `searchByTitleOrDescription` (CollectionListSection.tsx)
 * - Task 6: `onSortChange` and `sortCollections` (CollectionToolbar.tsx, CollectionListSection.tsx)
 * - Task 7: `editCollectionPoster` (EditCollectionModal.tsx)
 * - Task 8: `editMemoryPoster` (EditMemoryItemModal.tsx, MemoryBookModal.tsx)
 * - Color Management: `colorManagement` (Theme color configuration across UI)
 */

export * from './task-1'
export * from './task-2'
export * from './task-3'
export * from './task-4'
export * from './task-5'
export * from './task-6'
export * from './task-7'
export * from './task-8'
export * from './color-management'
