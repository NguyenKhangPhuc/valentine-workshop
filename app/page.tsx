import { getAllCollectionsWithCollectionItems } from "./actions/collection";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { CollectionListSection } from "./components/CollectionListSection";
import { CollectionWithItems } from "./types/collection";

export default async function Home() {
  const { data, error } = await getAllCollectionsWithCollectionItems();

  if (error) {
    console.error("Error fetching collections:", error);
  }

  // Cast data safely to CollectionWithItems array
  const collections: CollectionWithItems[] = (data as CollectionWithItems[]) || [];

  return (
    <main className="min-h-screen bg-white text-[#1f0c33] flex flex-col font-sans selection:bg-[#b63add] selection:text-white">
      {/* Fixed Centered Navigation Bar */}
      <Navbar />

      {/* Hero Section with Parallax Scroll & zng_bg.png Background */}
      <HeroSection />

      {/* Collections Section (4 cols per row, Create Modal, View/Edit/Delete actions) */}
      <CollectionListSection initialCollections={collections} />
    </main>
  );
}
