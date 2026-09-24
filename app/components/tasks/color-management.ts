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
 * - `app/components/MemoryBookModal.tsx`: Memory book modal chrome, navigation, book pages, and memory item content.
 * - `app/components/CreateMemoryItemModal.tsx`: Create memory item modal form, inputs, dropzone, and buttons.
 * - `app/components/EditMemoryItemModal.tsx`: Edit memory item modal form, inputs, dropzone, and buttons.
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

  // --------------------------------------------------------------------------
  // Memory Book Modal & Outer Shell Colors
  // --------------------------------------------------------------------------
  memoryBookModal: {
    // Sets the darkened backdrop color behind the flipbook modal.
    backdropBackground: 'rgba(0, 0, 0, 0.85)',

    // Sets the ambient glowing horizontal gradient behind the flipbook container.
    glowGradient: 'linear-gradient(to right, rgba(32, 0, 42, 0.3), transparent, rgba(182, 58, 221, 0.3))',

    // Top toolbar chrome colors
    header: {
      // Sets the text color of the "Memory Book" small uppercase label.
      categoryColor: '#b63add',

      // Sets the collection title text color in the modal header.
      titleColor: '#ffffff',

      // "+ Create Memory" top action button
      createButton: {
        backgroundColor: '#b63add',
        hoverBackgroundColor: '#9c28bd',
        textColor: '#ffffff',
        shadowColor: '0 10px 15px -3px rgba(182, 58, 221, 0.3)',
      },

      // Modal close button ('✕')
      closeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        textColor: '#ffffff',
      },
    },

    // Bottom navigation controls & page number indicator
    navigation: {
      prevButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        hoverBackgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        textColor: '#ffffff',
      },
      nextButton: {
        backgroundColor: '#b63add',
        hoverBackgroundColor: '#9c28bd',
        textColor: '#ffffff',
        shadowColor: '0 10px 15px -3px rgba(182, 58, 221, 0.3)',
      },
      pageInput: {
        containerBg: 'rgba(255, 255, 255, 0.1)',
        containerBorder: 'rgba(255, 255, 255, 0.2)',
        labelColor: '#d1d5db',
        inputBg: 'rgba(255, 255, 255, 0.2)',
        inputBorder: 'rgba(255, 255, 255, 0.3)',
        inputFocusBorder: '#b63add',
        inputTextColor: '#ffffff',
      },
    },
  },

  // --------------------------------------------------------------------------
  // Memory Book Pages & Content Theme Colors
  // --------------------------------------------------------------------------
  memoryBookPage: {
    // Base book page layout wrapper
    base: {
      backgroundColor: '#ffffff',
      borderColor: '#e9dcf5',
      shadowColor: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },

    // Front Cover page colors
    frontCover: {
      backgroundGradient: 'linear-gradient(to bottom right, #b63add, #8b22b3)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      dividerColor: 'rgba(255, 255, 255, 0.2)',
      badgeColor: 'rgba(255, 255, 255, 0.8)',
      posterBorderColor: 'rgba(255, 255, 255, 0.3)',
      titleColor: '#ffffff',
      descriptionColor: 'rgba(255, 255, 255, 0.8)',
      promptColor: 'rgba(255, 255, 255, 0.9)',
    },

    // Back Cover page colors
    backCover: {
      backgroundColor: '#1f0c33',
      borderColor: 'rgba(182, 58, 221, 0.3)',
      dividerColor: 'rgba(255, 255, 255, 0.1)',
      badgeColor: '#b63add',
      titleColor: '#ffffff',
      subtitleColor: 'rgba(245, 220, 253, 0.9)',
      footerColor: '#9ca3af',
    },

    // Companion and empty placeholder pages
    companionPage: {
      backgroundColor: '#fcfbfe',
      cardBackgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderColor: '#e9dcf5',
      pageLabelColor: '#9681ab',
      badgeColor: '#b63add',
      iconBoxBg: '#faf0fe',
      iconBoxBorder: '#e9dcf5',
      iconColor: '#b63add',
      titleColor: '#1f0c33',
      descriptionColor: '#624d78',
      button: {
        backgroundColor: '#b63add',
        hoverBackgroundColor: '#9c28bd',
        textColor: '#ffffff',
        shadowColor: '0 4px 6px -1px rgba(182, 58, 221, 0.25)',
      },
      footerTextColor: '#9681ab',
    },

    // Memory Item page inside the book
    itemPage: {
      toolbar: {
        borderColor: '#e9dcf5',
        badgeColor: '#b63add',
        editButton: {
          backgroundColor: 'rgba(182, 58, 221, 0.1)',
          hoverBackgroundColor: '#b63add',
          textColor: '#b63add',
          hoverTextColor: '#ffffff',
        },
        deleteButton: {
          backgroundColor: '#fff1f2',
          hoverBackgroundColor: '#e11d48',
          textColor: '#e11d48',
          hoverTextColor: '#ffffff',
        },
      },
      dropzone: {
        borderColor: 'rgba(182, 58, 221, 0.4)',
        hoverBorderColor: '#b63add',
        draggingBorderColor: '#b63add',
        backgroundColor: '#fcfbfe',
        hoverBackgroundColor: 'rgba(244, 230, 252, 0.2)',
        draggingBackgroundColor: 'rgba(244, 230, 252, 0.6)',
        plusBg: '#f4e6fc',
        plusColor: '#b63add',
        textColor: '#b63add',
        subtextColor: '#9681ab',
      },
      preview: {
        overlayBackground: 'rgba(0, 0, 0, 0.4)',
        removeButton: {
          backgroundColor: '#ffffff',
          hoverBackgroundColor: '#fff1f2',
          textColor: '#e11d48',
        },
        changeButton: {
          backgroundColor: '#b63add',
          hoverBackgroundColor: '#9c28bd',
          textColor: '#ffffff',
        },
      },
      content: {
        titleColor: '#1f0c33',
        dateColor: '#b63add',
        descriptionColor: '#624d78',
        scrollbarTrack: '#faf0fe',
        scrollbarThumb: 'rgba(182, 58, 221, 0.35)',
        scrollbarThumbHover: '#b63add',
      },
      footer: {
        borderColor: '#f0e6fa',
        orderBadgeBg: '#f4e6fc',
        orderBadgeText: '#b63add',
        pageNumberColor: '#9681ab',
      },
    },
  },

  // --------------------------------------------------------------------------
  // Memory Item Dialogs (Create & Edit Modals)
  // --------------------------------------------------------------------------
  memoryItemModal: {
    backdropBackground: 'rgba(0, 0, 0, 0.6)',
    dialog: {
      backgroundColor: '#ffffff',
      borderColor: '#e9dcf5',
      textColor: '#1f0c33',
    },
    header: {
      titleColor: '#1f0c33',
      dividerColor: '#e9dcf5',
      closeButton: {
        backgroundColor: '#f3f4f6',
        hoverBackgroundColor: '#e5e7eb',
        textColor: '#6b7280',
        hoverTextColor: '#1f2937',
      },
    },
    form: {
      labelColor: '#5c4775',
      requiredColor: '#b63add',
      inputBackground: '#fcfbfe',
      inputBorderColor: '#e9dcf5',
      inputTextColor: '#1f0c33',
      inputFocusBorderColor: '#b63add',
      errorColor: '#f43f5e',
    },
    dropzone: {
      borderColor: 'rgba(182, 58, 221, 0.4)',
      hoverBorderColor: '#b63add',
      draggingBorderColor: '#b63add',
      backgroundColor: '#fcfbfe',
      hoverBackgroundColor: 'rgba(244, 230, 252, 0.2)',
      draggingBackgroundColor: 'rgba(244, 230, 252, 0.6)',
      plusBg: '#f4e6fc',
      plusColor: '#b63add',
      textColor: '#b63add',
      subtextColor: '#9681ab',
    },
    preview: {
      borderColor: '#e9dcf5',
      deleteButton: {
        backgroundColor: '#e11d48',
        hoverBackgroundColor: '#be123c',
        textColor: '#ffffff',
      },
      overlayBackground: 'rgba(0, 0, 0, 0.3)',
      changeButton: {
        backgroundColor: '#ffffff',
        textColor: '#b63add',
      },
    },
    footer: {
      dividerColor: '#e9dcf5',
      cancelButton: {
        borderColor: '#e9dcf5',
        hoverBackgroundColor: '#f9fafb',
        textColor: '#5c4775',
      },
      submitButton: {
        backgroundColor: '#b63add',
        hoverBackgroundColor: '#9c28bd',
        textColor: '#ffffff',
        shadowColor: '0 4px 6px -1px rgba(182, 58, 221, 0.3)',
      },
    },
  },
} as const
