import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const ExplorePage = () => {
  const scrollRef = useRef(null);
  const [centerCardIndex, setCenterCardIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [activeTab, setActiveTab] = useState(1);

  const contentCards = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

  const bottomNavItems = [
    { id: 1, label: "All" },
    { id: 2, label: "Notes" },
    { id: 3, label: "Essays" },
    { id: 4, label: "Papers" },
  ];

  const getCategoryStyle = (category) => {
    const styles = {
      Notes: "bg-blue-100 text-blue-700",
      Essay: "bg-green-100 text-green-700",
      Paper: "bg-purple-100 text-purple-700",
    };
    return styles[category] || "bg-gray-100 text-gray-700";
  };

  // Rectangle content for each tab
  const allContent = [
    {
      id: 1,
      name: "Mountain View",
      category: "Notes",
      lastView: "2 hours ago",
      image: "rectangle-1.svg",
    },
    {
      id: 2,
      name: "City Lights",
      category: "Essay",
      lastView: "5 hours ago",
      image: "rectangle-2.svg",
    },
    {
      id: 3,
      name: "Ocean Waves",
      category: "Paper",
      lastView: "1 day ago",
      image: "rectangle-3.svg",
    },
    {
      id: 4,
      name: "Forest Path",
      category: "Notes",
      lastView: "2 days ago",
      image: "rectangle-4.svg",
    },
    {
      id: 5,
      name: "Sunset Beach",
      category: "Essay",
      lastView: "3 days ago",
      image: "rectangle-5.svg",
    },
    {
      id: 6,
      name: "Urban Art",
      category: "Paper",
      lastView: "4 days ago",
      image: "rectangle-6.svg",
    },
    {
      id: 7,
      name: "Coffee Shop",
      category: "Notes",
      lastView: "30 mins ago",
      image: "rectangle-1.svg",
    },
    {
      id: 8,
      name: "Park Trail",
      category: "Essay",
      lastView: "3 hours ago",
      image: "rectangle-2.svg",
    },
    {
      id: 9,
      name: "Design Ideas",
      category: "Paper",
      lastView: "Yesterday",
      image: "rectangle-1.svg",
    },
    {
      id: 10,
      name: "Recipe Book",
      category: "Notes",
      lastView: "2 days ago",
      image: "rectangle-2.svg",
    },
  ];

  const getFilteredRectangles = () => {
    if (activeTab === 1) return allContent; // All
    if (activeTab === 2)
      return allContent.filter((item) => item.category === "Notes"); // Notes
    if (activeTab === 3)
      return allContent.filter((item) => item.category === "Essay"); // Essays
    if (activeTab === 4)
      return allContent.filter((item) => item.category === "Paper"); // Papers
    return allContent;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.offsetWidth;
    const cards = container.querySelectorAll(".card-item");

    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const cardLeft = card.offsetLeft;
      const cardWidth = card.offsetWidth;
      const cardCenter = cardLeft + cardWidth / 2;
      const containerCenter = scrollLeft + containerWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setCenterCardIndex(closestIndex);
  };

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);

      // Scroll to center the 3rd card initially
      const cards = container.querySelectorAll(".card-item");
      if (cards.length >= 3) {
        const thirdCard = cards[2]; // Index 2 = 3rd card
        const cardLeft = thirdCard.offsetLeft;
        const cardWidth = thirdCard.offsetWidth;
        const containerWidth = container.offsetWidth;
        const scrollPosition = cardLeft - containerWidth / 2 + cardWidth / 2;
        container.scrollLeft = scrollPosition;
      }

      handleScroll();
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const currentRectangles = getFilteredRectangles();

  return (
    <main className="bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen border-8 border-purple-200 overflow-y-auto">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 ml-20">
          <article className="bg-white rounded-t-3xl shadow-xl p-6 max-w-6xl">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Main scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Scrollable Cards Section */}
                <div className="pt-8 px-6">
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={`flex gap-6 overflow-x-auto pb-4 scroll-smooth ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    }`}
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                      userSelect: "none",
                    }}
                  >
                    {contentCards.map((card, index) => {
                      const isCentered = index === centerCardIndex;
                      return (
                        <div
                          key={card.id}
                          className={`card-item flex-shrink-0 bg-gray-200 rounded-3xl shadow-sm transition-all duration-300 ${
                            isCentered
                              ? "w-[500px] h-[333px] scale-110 shadow-xl"
                              : "w-[480px] h-[320px] scale-90 opacity-60"
                          }`}
                        >
                          <div className="w-full h-full flex items-center justify-center p-8">
                            <div className="flex flex-col items-center gap-4">
                              <div
                                className="w-16 h-16 bg-gray-300"
                                style={{
                                  clipPath:
                                    "polygon(50% 0%, 0% 100%, 100% 100%)",
                                }}
                              />
                              <div className="flex gap-4">
                                <div
                                  className="w-12 h-12 bg-gray-300"
                                  style={{
                                    borderRadius: "50%",
                                  }}
                                />
                                <div className="w-12 h-12 bg-gray-300 rounded-lg" />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show All Button */}
                  <div className="flex justify-end mt-6">
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                      Show all
                    </button>
                  </div>
                </div>

                {/* Bottom Navigation Tabs */}
                <div className="px-6 py-6">
                  <nav
                    className="flex items-center gap-2 bg-[#f3edf7] rounded-full p-2 w-fit mx-auto"
                    role="tablist"
                  >
                    {bottomNavItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        role="tab"
                        aria-selected={activeTab === item.id}
                        className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                          activeTab === item.id
                            ? "bg-purple-600 text-white"
                            : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                        }`}
                      >
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Rectangles Section - All displayed, scroll page to see more */}
                <div className="px-8 pb-6">
                  <div className="grid grid-cols-4 gap-12 max-w-6xl mx-auto">
                    {currentRectangles.map((rect) => (
                      <div
                        key={rect.id}
                        className="bg-white rounded-[10px] w-64 h-[187px] shadow-lg relative overflow-hidden"
                      >
                        {/* Image placeholder */}
                        <div className="w-full h-[114px] bg-gray-200 flex items-center justify-center">
                          <div className="text-gray-400 text-xs">Image</div>
                        </div>

                        {/* Bottom right info */}
                        <div className="absolute bottom-1 left-4">
                          <h3 className="font-semibold text-sm text-gray-900">
                            {rect.name}
                          </h3>
                          <p
                            className={`text-xs mt-0 px-0 py-0.5 rounded-md inline-block ${getCategoryStyle(
                              rect.category
                            )}`}
                          >
                            {rect.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {rect.lastView}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
};

export default ExplorePage;
