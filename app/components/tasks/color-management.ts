/**
 * ============================================================================
 * Task: Color Management
 * ============================================================================
 *
 * @file color-management.ts
 * @module components/tasks/color-management
 *
 * @description
 * Centralized theme color configuration for the  Memory Book application.
 * Editing any property in this file immediately updates the corresponding UI elements
 * on the home page, navigation bar, hero canvas animation, and collection buttons.
 *
 * @usedBy
 * - `app/page.tsx`: Page root background and primary text colors.
 * - `app/components/HeroSection.tsx`: Falling hearts, hero gradient, and CTA styling.
 * - `app/components/Navbar.tsx`: Floating navigation bar container and menu links.
 * - `app/components/CollectionListSection.tsx`: "Create Collection" button and section header.
 * - `app/components/CollectionCard.tsx`: Collection cards, borders, and View/Edit/Delete buttons.
 */

export const colorManagement = {
  // --------------------------------------------------------------------------
  // Home Page & Layout Theme Colors
  // --------------------------------------------------------------------------
  homePage: {
    // Sets the base background color of the entire home page and collections section.
    pageBackground: '#ffffff',

    // Sets the primary typography color for body text across the page.
    textColor: '#1f0c33',

    // Sets the background gradient of the hero banner at the top of the home page.
    heroBackgroundGradient: 'linear-gradient(160deg, #c040ef 0%, #b63add 40%, #8b22b3 100%)',

    // Sets the text color of the "Book" badge inside the main "MemoryBook" title.
    titleBadgeTextColor: '#b63add',

    // Sets the background color of the "Book" badge inside the main title.
    titleBadgeBackgroundColor: 'rgba(255, 255, 255, 0.97)',

    // Sets the text color of the "Explore Collections" button in the hero section.
    exploreButtonTextColor: '#b63add',

    // Sets the background color of the "Explore Collections" button in the hero section.
    exploreButtonBackgroundColor: 'rgba(255, 255, 255, 0.97)',

    // Sets the border divider color between the section header and collection cards.
    collectionsSectionBorderColor: '#e9dcf5',

    // Sets the accent color of the category label and collection count badge.
    categoryLabelColor: '#b63add',
  },

  // --------------------------------------------------------------------------
  // Falling Hearts Animation Colors
  // --------------------------------------------------------------------------
  fallingHearts: {
    // Sets the fill color of the animated hearts drifting down the hero canvas.
    heartColor: '#ffffff',
  },

  // --------------------------------------------------------------------------
  // Navigation Bar Container Colors
  // --------------------------------------------------------------------------
  navbar: {
    // Sets the glassmorphism background of the navbar when the page is scrolled.
    scrolledBackground: 'rgba(255, 255, 255, 0.12)',

    // Sets the border outline of the navbar pill when the page is scrolled.
    scrolledBorderColor: 'rgba(255, 255, 255, 0.2)',

    // Sets the glow shadow underneath the navbar pill when the page is scrolled.
    scrolledShadowColor: '0 4px 24px rgba(182, 58, 221, 0.12)',

    // Sets the navbar background before the user scrolls down the page.
    unscrolledBackground: 'transparent',

    // Sets the navbar border before the user scrolls down the page.
    unscrolledBorderColor: 'transparent',
  },

  // --------------------------------------------------------------------------
  // Navigation Menu Items Colors
  // --------------------------------------------------------------------------
  navItem: {
    // Sets the text color of the currently active navigation tab (e.g. Home or Collections).
    activeTextColor: '#b63add',

    // Sets the background pill color of the currently active navigation tab.
    activeBackgroundColor: '#ffffff',

    // Sets the text color of inactive navigation tabs when not selected.
    inactiveTextColor: 'rgba(10, 10, 10, 0.9)',

    // Sets the text color when hovering over an inactive navigation tab.
    inactiveHoverTextColor: '#ffffff',

    // Sets the subtle highlight background when hovering over an inactive navigation tab.
    inactiveHoverBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // --------------------------------------------------------------------------
  // "Create Collection" Action Button Colors
  // --------------------------------------------------------------------------
  createCollectionButton: {
    // Sets the primary background color of the "+ Create Collection" button.
    backgroundColor: '#b63add',

    // Sets the hover background color when the cursor moves over the button.
    hoverBackgroundColor: '#9c28bd',

    // Sets the text and plus-icon color of the "+ Create Collection" button.
    textColor: '#ffffff',

    // Sets the accent glow shadow cast below the "+ Create Collection" button.
    shadowColor: '0 10px 15px -3px rgba(182, 58, 221, 0.25)',
  },

  // --------------------------------------------------------------------------
  // Collection Cards & Card Borders
  // --------------------------------------------------------------------------
  collectionCard: {
    // Sets the background surface color of each collection card.
    backgroundColor: '#ffffff',

    // Sets the default border outline color around each collection card.
    borderColor: '#e9dcf5',

    // Sets the border color when hovering over a collection card.
    hoverBorderColor: '#b63add',

    // Sets the primary title text color for the collection name.
    titleColor: '#1f0c33',

    // Sets the title text color when hovering over the collection card.
    hoverTitleColor: '#b63add',

    // Sets the narrative description text color on the collection card.
    descriptionColor: '#624d78',

    // Sets the text and accent color of the memory count badge and event date.
    badgeColor: '#b63add',

    // Sets the background pill color of the memory count badge.
    badgeBackgroundColor: 'rgba(255, 255, 255, 0.9)',

    // Sets the soft glow shadow cast underneath cards when hovered.
    hoverShadowColor: '0 20px 25px -5px rgba(182, 58, 221, 0.1)',
  },

  // --------------------------------------------------------------------------
  // Collection Action Buttons: View, Edit, Delete
  // --------------------------------------------------------------------------
  collectionButtons: {
    view: {
      // Sets the default background color of the "View" card button.
      backgroundColor: 'rgba(182, 58, 221, 0.1)',

      // Sets the background color of the "View" button on hover.
      hoverBackgroundColor: '#b63add',

      // Sets the border outline color of the "View" card button.
      borderColor: 'rgba(182, 58, 221, 0.2)',

      // Sets the border outline color of the "View" button on hover.
      hoverBorderColor: '#b63add',

      // Sets the text color of the "View" card button.
      textColor: '#b63add',

      // Sets the text color of the "View" button on hover.
      hoverTextColor: '#ffffff',
    },
    edit: {
      // Sets the default background color of the "Edit" card button.
      backgroundColor: '#fcfbfe',

      // Sets the background color of the "Edit" button on hover.
      hoverBackgroundColor: '#f4e6fc',

      // Sets the border outline color of the "Edit" card button.
      borderColor: '#e9dcf5',

      // Sets the text color of the "Edit" card button.
      textColor: '#5c4775',

      // Sets the text color of the "Edit" button on hover.
      hoverTextColor: '#b63add',
    },
    delete: {
      // Sets the default background color of the "Delete" card button.
      backgroundColor: '#fff1f2',

      // Sets the background color of the "Delete" button on hover.
      hoverBackgroundColor: '#ffe4e6',

      // Sets the border outline color of the "Delete" card button.
      borderColor: '#fecdd3',

      // Sets the text color of the "Delete" card button.
      textColor: '#e11d48',

      // Sets the text color of the "Delete" button on hover.
      hoverTextColor: '#be123c',
    },
  },
} as const
