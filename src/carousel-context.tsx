import { createContext, useContext } from "react";

export interface CarouselContextValue {
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export const CarouselContext = createContext<CarouselContextValue>(null);

export function useCarouselContext() {
  const context = useContext(CarouselContext);

  if (context === null) {
    throw new Error("useCarouselContext must be used within a Carousel");
  }

  return context;
}
