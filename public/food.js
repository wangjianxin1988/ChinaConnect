document.getElementById("city-select")?.addEventListener("change", (e) => {
  window.location.href = `/food?city=${e.target.value}`;
});

(() => {
  const mapEl = document.getElementById("map");
  if (mapEl) {
    const restaurants = JSON.parse(mapEl.dataset.restaurants || "[]");
    const center = JSON.parse(mapEl.dataset.center || "[31.2304, 121.4737]");
    const map = L.map("map").setView(center, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    const TYPE_COLORS = { michelin: "#1E3A5F", blackpearl: "#2D1B4E", local: "#B8383D" };
    const TYPE_ICONS = { michelin: "⭐", blackpearl: "💎", local: "🔥" };
    const markers = [];
    let selectedTypes = ["michelin", "blackpearl", "local"];

    function updateMarkers() {
      markers.forEach((m) => m.remove());
      markers.length = 0;
      restaurants
        .filter((r) => selectedTypes.includes(r.type))
        .forEach((r) => {
          const icon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background:${TYPE_COLORS[r.type]};color:white;padding:8px 12px;border-radius:20px;font-size:14px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.3);white-space:nowrap;">${TYPE_ICONS[r.type]} ${
              r.type === "michelin"
                ? `${r.star}星`
                : r.type === "blackpearl"
                  ? `${r.diamond}钻`
                  : ""
            }</div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const marker = L.marker([r.lat, r.lng], { icon }).addTo(map);
          marker.on("click", () => {
            window.location.href = `/food/${r.id}`;
          });
          markers.push(marker);
        });
    }
    updateMarkers();

    document.querySelectorAll("[data-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        if (selectedTypes.includes(type)) {
          if (selectedTypes.length > 1) {
            selectedTypes = selectedTypes.filter((t) => t !== type);
            btn.classList.remove("bg-[#1E3A5F]", "bg-[#2D1B4E]", "bg-[#B8383D]");
            btn.classList.add("bg-gray-100", "text-gray-600");
          }
        } else {
          selectedTypes.push(type);
          btn.classList.add("bg-[#1E3A5F]", "bg-[#2D1B4E]", "bg-[#B8383D]");
          btn.classList.remove("bg-gray-100", "text-gray-600");
        }
        updateMarkers();
      });
    });
  }
})();

(() => {
  const filters = { cuisines: [], priceRange: null, minRating: null };

  document.querySelectorAll(".cuisine-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cuisine = btn.dataset.cuisine;
      if (filters.cuisines.includes(cuisine)) {
        filters.cuisines = filters.cuisines.filter((c) => c !== cuisine);
        btn.classList.remove("bg-blue-600", "text-white");
        btn.classList.add("bg-gray-100", "text-gray-600");
      } else {
        filters.cuisines.push(cuisine);
        btn.classList.add("bg-blue-600", "text-white");
        btn.classList.remove("bg-gray-100", "text-gray-600");
      }
      applyFilters();
    });
  });

  document.querySelectorAll(".price-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parts = btn.dataset.price.split(",").map(Number);
      document.querySelectorAll(".price-btn").forEach((b) => {
        b.classList.remove("bg-green-600", "text-white");
        b.classList.add("bg-gray-100", "text-gray-600");
      });
      btn.classList.add("bg-green-600", "text-white");
      btn.classList.remove("bg-gray-100", "text-gray-600");
      filters.priceRange = [parts[0], parts[1]];
      applyFilters();
    });
  });

  document.querySelectorAll(".rating-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const rating = Number.parseFloat(btn.dataset.rating);
      document.querySelectorAll(".rating-btn").forEach((b) => {
        b.classList.remove("bg-yellow-500", "text-white");
        b.classList.add("bg-gray-100", "text-gray-600");
      });
      btn.classList.add("bg-yellow-500", "text-white");
      btn.classList.remove("bg-gray-100", "text-gray-600");
      filters.minRating = rating;
      applyFilters();
    });
  });

  document.getElementById("reset-filters")?.addEventListener("click", () => {
    filters.cuisines = [];
    filters.priceRange = null;
    filters.minRating = null;
    document.querySelectorAll(".cuisine-btn, .price-btn, .rating-btn").forEach((b) => {
      b.classList.remove("bg-blue-600", "bg-green-600", "bg-yellow-500", "text-white");
      b.classList.add("bg-gray-100", "text-gray-600");
    });
    applyFilters();
  });

  function applyFilters() {
    document.querySelectorAll("[data-cuisine]").forEach((card) => {
      const el = card;
      const cuisine = el.dataset.cuisine;
      const price = Number.parseInt(el.dataset.price);
      const rating = Number.parseFloat(el.dataset.rating);
      let show = true;
      if (filters.cuisines.length > 0 && !filters.cuisines.includes(cuisine)) show = false;
      if (filters.priceRange && (price < filters.priceRange[0] || price > filters.priceRange[1]))
        show = false;
      if (filters.minRating && rating < filters.minRating) show = false;
      el.closest("a").style.display = show ? "block" : "none";
    });
  }
})();

document.getElementById("tab-scan")?.addEventListener("click", () => {
  document
    .getElementById("tab-scan")
    .classList.add("text-blue-600", "border-b-2", "border-blue-600");
  document
    .getElementById("tab-recommend")
    .classList.remove("text-blue-600", "border-b-2", "border-blue-600");
  document.getElementById("scan-tab").classList.remove("hidden");
  document.getElementById("recommend-tab").classList.add("hidden");
});

document.getElementById("tab-recommend")?.addEventListener("click", () => {
  document
    .getElementById("tab-recommend")
    .classList.add("text-blue-600", "border-b-2", "border-blue-600");
  document
    .getElementById("tab-scan")
    .classList.remove("text-blue-600", "border-b-2", "border-blue-600");
  document.getElementById("recommend-tab").classList.remove("hidden");
  document.getElementById("scan-tab").classList.add("hidden");
});

document
  .getElementById("upload-btn")
  ?.addEventListener("click", () => document.getElementById("menu-photo")?.click());
document
  .getElementById("upload-area")
  ?.addEventListener("click", () => document.getElementById("menu-photo")?.click());

document.getElementById("menu-photo")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const area = document.getElementById("upload-area");
    area.innerHTML =
      '<div class="text-center py-4"><div class="animate-spin text-3xl mb-2">⏳</div><p class="text-gray-600">正在识别菜单...</p></div>';
    setTimeout(() => {
      const dishes = [
        {
          name: "宫保鸡丁",
          nameEn: "Kung Pao Chicken",
          price: 48,
          recommended: true,
          allergens: ["花生"],
        },
        {
          name: "麻婆豆腐",
          nameEn: "Mapo Tofu",
          price: 32,
          recommended: true,
          allergens: ["大豆"],
        },
        {
          name: "水煮鱼",
          nameEn: "Boiled Fish",
          price: 88,
          recommended: false,
          allergens: ["鱼", "辣椒"],
        },
      ];
      let html = "";
      dishes.forEach((d) => {
        html += `<div class="p-3 rounded-lg border ${d.recommended ? "border-green-200 bg-green-50" : "border-gray-200"}">`;
        html += `<div class="flex justify-between"><div><p class="font-medium text-gray-900">${d.name}</p><p class="text-sm text-gray-500">${d.nameEn}</p></div>`;
        html += `<div class="text-right"><p class="font-medium text-orange-600">¥${d.price}</p>${d.recommended ? '<span class="text-xs text-green-600">✨ 推荐</span>' : ""}</div></div>`;
        if (d.allergens?.length) {
          html += `<div class="mt-2 flex gap-1">${d.allergens
            .map(
              (a) =>
                `<span class="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">⚠️ 含${a}</span>`,
            )
            .join("")}</div>`;
        }
        html += "</div>";
      });
      document.getElementById("dish-list").innerHTML = html;
      document.getElementById("scan-result").classList.remove("hidden");
    }, 2000);
  }
});
