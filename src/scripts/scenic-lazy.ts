// Client-side lazy loading for the scenic-spots hub page.
//
// The page server-renders the first N cards; this script progressively
// appends the remaining cards from /scenic-data/{lang}.json when the user
// scrolls to the bottom or clicks "Load more", and drives the category/city
// filters across both SSR and JS-rendered cards.
//
// Hooked up from scenic-spots pages via: initScenicLazy(document.getElementById("scenic-app"))

export interface ScenicItem {
  category: string;
  citySlug: string;
  cityNameEn: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function initScenicLazy(root: HTMLElement): void {
  const grid = root.querySelector<HTMLElement>("#scenic-grid");
  const loadBtn = root.querySelector<HTMLButtonElement>("#scenic-load-more");
  const status = root.querySelector<HTMLElement>("#scenic-status");
  const sentinel = root.querySelector<HTMLElement>("#scenic-sentinel");
  const citySelect = root.querySelector<HTMLSelectElement>("#scenic-city-filter");
  const filterButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(".scenic-category-filter"));
  if (!grid || !loadBtn || !citySelect) return;
  const gridEl = grid;
  const loadBtnEl = loadBtn;
  const citySelectEl = citySelect;

  const jsonUrl = root.dataset.jsonUrl || "";
  const ssrCount = parseInt(root.dataset.ssrCount || "36", 10);
  const chunkSize = parseInt(root.dataset.chunkSize || "36", 10);
  const serverTotal = parseInt(root.dataset.total || "0", 10);
  const strLoadMore = root.dataset.loadMore || "Load more";
  const strShownOf = root.dataset.shownOf || "Showing {shown} of {total}";
  const strLoading = root.dataset.loading || "Loading more...";

  const baseBtnClass =
    "scenic-category-filter px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200";
  const activeBtnClass =
    "scenic-category-filter px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white";

  let all: ScenicItem[] | null = null;
  let dataLoaded = false;
  let dataLoading = false;
  let loadedCount = ssrCount;
  let activeCategory = "all";
  let activeCity = "all";
  const rendered = new Set<string>();

  // Seed with the SSR-rendered cards so we never duplicate them.
  gridEl.querySelectorAll<HTMLElement>(".scenic-card").forEach((card) => {
    const city = card.dataset.city || "";
    const title = card.querySelector("h3")?.textContent?.trim() || "";
    rendered.add(city + "|" + title);
  });

  function setLoading(on: boolean): void {
    loadBtnEl.disabled = on;
    loadBtnEl.textContent = on ? strLoading : strLoadMore;
  }

  let dataPromise: Promise<void> | null = null;

  function loadAll(): Promise<void> {
    if (!jsonUrl) return Promise.resolve();
    // All callers share one in-flight fetch; every .then(renderNew) waits for
    // the same promise so a filter click during an auto-load still applies.
    if (dataLoaded || dataPromise) return dataPromise || Promise.resolve();
    dataPromise = (async () => {
      dataLoading = true;
      setLoading(true);
      try {
        const res = await fetch(jsonUrl);
        if (!res.ok) throw new Error("scenic data fetch failed");
        all = (await res.json()) as ScenicItem[];
        dataLoaded = true;
      } catch {
        // Keep the SSR-rendered cards; the page still works for the first screen.
      } finally {
        dataLoading = false;
        setLoading(false);
        updateStatus();
      }
    })();
    return dataPromise;
  }

  function matches(item: ScenicItem): boolean {
    return (
      (activeCategory === "all" || item.category === activeCategory) &&
      (activeCity === "all" || item.citySlug === activeCity)
    );
  }

  function cardHtml(item: ScenicItem): string {
    const img = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy"/>`
      : '<div class="w-full h-full flex items-center justify-center text-gray-400 text-3xl">&#127796;</div>';
    return `<a href="${escapeHtml(item.href)}" class="scenic-card group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-green-300 hover:shadow-md transition-all" data-category="${escapeHtml(item.category)}" data-city="${escapeHtml(item.citySlug)}">
  <div class="aspect-[16/9] bg-gray-100 overflow-hidden">${img}</div>
  <div class="p-4">
    <p class="text-xs text-green-600 font-medium mb-1">${escapeHtml(item.cityNameEn)}</p>
    <h3 class="font-semibold text-gray-900 mb-1 truncate">${escapeHtml(item.title)}</h3>
    <p class="text-sm text-gray-600 line-clamp-2">${escapeHtml(item.description)}</p>
  </div>
</a>`;
  }

  function ensureRendered(items: ScenicItem[]): void {
    for (const item of items) {
      const key = item.citySlug + "|" + item.title;
      if (rendered.has(key)) continue;
      rendered.add(key);
      gridEl.insertAdjacentHTML("beforeend", cardHtml(item));
    }
  }

  function applyFilter(): void {
    gridEl.querySelectorAll<HTMLElement>(".scenic-card").forEach((card) => {
      const cat = card.dataset.category || "other";
      const city = card.dataset.city || "";
      const show =
        (activeCategory === "all" || cat === activeCategory) &&
        (activeCity === "all" || city === activeCity);
      card.style.display = show ? "" : "none";
    });
  }

  function updateStatus(): void {
    const shown = gridEl.querySelectorAll('.scenic-card:not([style*="display: none"])').length;
    let total = serverTotal;
    if (dataLoaded && all) {
      total =
        activeCategory === "all" && activeCity === "all"
          ? all.length
          : all.filter(matches).length;
    }
    if (status) {
      status.textContent = strShownOf.replace("{shown}", String(shown)).replace("{total}", String(total));
      status.classList.remove("hidden");
    }
    if (dataLoaded && all && shown >= total) {
      loadBtnEl.classList.add("hidden");
      sentinel?.classList.add("hidden");
    } else {
      loadBtnEl.classList.remove("hidden");
      loadBtnEl.textContent = strLoadMore;
      loadBtnEl.disabled = false;
    }
  }

  function renderNew(): void {
    if (!all) return;
    const list =
      activeCategory === "all" && activeCity === "all"
        ? all.slice(0, loadedCount)
        : all.filter(matches);
    ensureRendered(list);
    applyFilter();
    updateStatus();
  }

  function loadMore(): void {
    if (dataLoading) return;
    if (!dataLoaded) {
      loadAll().then(() => {
        if (dataLoaded && all) {
          loadedCount += chunkSize;
          renderNew();
        }
      });
      return;
    }
    loadedCount += chunkSize;
    renderNew();
  }

  loadBtnEl.addEventListener("click", loadMore);

  if ("IntersectionObserver" in window && sentinel) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !dataLoading) loadMore();
      },
      { rootMargin: "600px" },
    );
    io.observe(sentinel);
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category || "all";
      filterButtons.forEach((b) => {
        b.className = baseBtnClass;
      });
      btn.className = activeBtnClass;
      if (activeCategory === "all" && activeCity === "all") {
        loadedCount = Math.max(loadedCount, chunkSize);
        renderNew();
      } else {
        loadAll().then(renderNew);
      }
    });
  });

  citySelectEl.addEventListener("change", () => {
    activeCity = citySelectEl.value;
    if (activeCategory === "all" && activeCity === "all") {
      loadedCount = Math.max(loadedCount, chunkSize);
      renderNew();
    } else {
      loadAll().then(renderNew);
    }
  });
}
