import React, { useEffect, useState } from "react";

export default function AuctionFeed() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("/api/auctions");
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      }
    };

    fetchListings();
    const interval = setInterval(fetchListings, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-xl shadow-md max-h-[80vh] overflow-y-auto w-full">
      <h2 className="text-xl font-bold mb-4 text-center">Live Auction Feed</h2>
      {listings.map((item, index) => (
        <div key={index} className="mb-4 p-3 border-b border-gray-700">
          <div className="text-lg font-semibold">{item.seller}</div>
          <div className="text-sm">
            Selling: <span className="font-medium">{item.item.name}</span> ×{item.item.count}
          </div>
          <div className="text-sm">Price: ${item.price.toLocaleString()}</div>
          {item.item.enchantments?.length > 0 && (
            <div className="text-xs text-gray-300 mt-1">
              Enchantments: {item.item.enchantments.map((e) => `${e.name} ${e.level}`).join(", ")}
            </div>
          )}
          {item.item.shulker_box_contents && (
            <div className="text-xs text-blue-300 mt-1">
              Shulker Contents: {item.item.shulker_box_contents.length} items
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
