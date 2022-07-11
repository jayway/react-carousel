import {
  cloneElement,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { mergeRefs } from "react-merge-refs";
import { useSwipeable } from "react-swipeable";
import useResizeObserver from "use-resize-observer";

import { CarouselContext, CarouselContextValue } from "./carousel-context";
import * as styles from "./carousel.style";

export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: ReactElement[];
  classPrefix?: string;
  children?: ReactNode | ((value: CarouselContextValue) => ReactNode);
}

export function Carousel({
  items,
  children,
  classPrefix = "carousel",
  ...props
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const { ref: containerRef, width = 0 } = useResizeObserver<HTMLDivElement>();

  const prevPage = useCallback(() => {
    setCurrentPage((currentPage) => Math.max(0, currentPage - 1));
  }, []);

  const nextPage = useCallback(() => {
    if (totalPages) {
      setCurrentPage((currentPage) =>
        Math.min(currentPage + 1, totalPages - 1)
      );
    }
  }, [totalPages]);

  const goToPage = useCallback(
    (page: number) => {
      if (totalPages) {
        setCurrentPage(Math.min(Math.max(0, page), totalPages - 1));
      }
    },
    [totalPages]
  );

  const { ref: swipeableRef, ...handlers } = useSwipeable({
    preventScrollOnSwipe: true,
    onSwiped: (eventData) => {
      if (eventData.dir === "Left") {
        nextPage();
      }
      if (eventData.dir === "Right") {
        prevPage();
      }
    },
  });

  const value: CarouselContextValue = {
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  };

  useEffect(() => {
    if (width && trackRef.current) {
      setTotalPages(Math.ceil(trackRef.current.scrollWidth / width));
    }
  }, [width, items.length]);

  return (
    <CarouselContext.Provider value={value}>
      <div {...props}>
        <div
          {...handlers}
          ref={mergeRefs([containerRef, swipeableRef])}
          style={styles.container()}
          className={`${classPrefix}-container`}
        >
          <div
            ref={trackRef}
            style={styles.track({ currentPage })}
            className={`${classPrefix}-track`}
          >
            {items.map((item) =>
              cloneElement(item, {
                style: { ...item.props.style, ...styles.item() },
              })
            )}
          </div>
        </div>
        {typeof children === "function" ? children(value) : children}
      </div>
    </CarouselContext.Provider>
  );
}
