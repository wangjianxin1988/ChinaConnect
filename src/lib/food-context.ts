/**
 * Restaurant food context - manages selected map layers and filter state
 * Used client-side to sync LayerToggle + RestaurantFilter + restaurant list
 */
import type { FilterState, Restaurant, RestaurantType } from "@/types/food";

export type FoodFilterState = {
  selectedTypes: RestaurantType[];
  filter: FilterState;
};

type Listener = (state: FoodFilterState) => void;

class FoodFilterStore {
  private state: FoodFilterState = {
    selectedTypes: ["michelin", "blackpearl", "local"],
    filter: {
      cuisines: [],
      priceRange: null,
      distance: null,
      minRating: null,
      types: [],
      foreignerFriendly: false,
      hasEnglishMenu: false,
      hasPictureMenu: false,
    },
  };
  private listeners = new Set<Listener>();

  getState(): FoodFilterState {
    return this.state;
  }

  setSelectedTypes(types: RestaurantType[]) {
    this.state = { ...this.state, selectedTypes: types };
    this.broadcast();
  }

  toggleType(type: RestaurantType) {
    const { selectedTypes } = this.state;
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    this.setSelectedTypes(next);
  }

  setFilter(filter: FilterState) {
    this.state = { ...this.state, filter };
    this.broadcast();
  }

  updateFilter(partial: Partial<FilterState>) {
    this.setFilter({ ...this.state.filter, ...partial });
  }

  reset() {
    this.state = {
      selectedTypes: ["michelin", "blackpearl", "local"],
      filter: {
        cuisines: [],
        priceRange: null,
        distance: null,
        minRating: null,
        types: [],
        foreignerFriendly: false,
        hasEnglishMenu: false,
        hasPictureMenu: false,
      },
    };
    this.broadcast();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcast() {
    this.listeners.forEach((l) => l(this.state));
  }
}

export const foodFilterStore = new FoodFilterStore();

// --- Restaurant list filtering utilities ---

export function filterRestaurant(r: Restaurant, state: FoodFilterState): boolean {
  // Layer toggle: hide restaurants not in selected types
  if (!state.selectedTypes.includes(r.type)) return false;

  const { filter } = state;

  // Cuisine filter
  if (filter.cuisines.length > 0 && !filter.cuisines.includes(r.cuisine)) {
    return false;
  }

  // Price range filter
  if (filter.priceRange) {
    const [min, max] = filter.priceRange;
    if (r.avgPrice < min || r.avgPrice > max) return false;
  }

  // Min rating filter
  if (filter.minRating && r.rating < filter.minRating) {
    return false;
  }

  // Type filter (expanded)
  if (filter.types.length > 0 && !filter.types.includes(r.type)) {
    return false;
  }

  // Foreigner friendly filter
  if (filter.foreignerFriendly && !r.foreignerFriendly) {
    return false;
  }

  return true;
}

export function filterRestaurantList(
  restaurants: Restaurant[],
  state: FoodFilterState,
): Restaurant[] {
  return restaurants.filter((r) => filterRestaurant(r, state));
}
