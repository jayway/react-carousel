import {
  Children,
  cloneElement,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { mergeRefs } from "react-merge-refs";
import { useSwipeable } from "react-swipeable";
import useResizeObserver from "use-resize-observer";

import * as styles from "./carousel.style";

export interface CarouselHandle {
  currentPage: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  classPrefix?: string;
  children: ReactElement[];
}

export const Carousel = forwardRef<CarouselHandle, CarouselProps>(
  (props, ref) => {
    const {
      style,
      children,
      className = "",
      classPrefix = "carousel",
      ...other
    } = props;
    const trackRef = useRef<HTMLDivElement>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const { ref: containerRef, width = 0 } =
      useResizeObserver<HTMLDivElement>();
    const totalSlides = Children.count(children);

    const prevPage = useCallback(() => {
      setCurrentPage((currentPage) => Math.max(0, currentPage - 1));
    }, []);

    const nextPage = useCallback(() => {
      setCurrentPage((currentPage) =>
        Math.min(currentPage + 1, totalPages - 1)
      );
    }, [totalPages]);

    const goToPage = useCallback(
      (page: number) => {
        setCurrentPage(Math.min(Math.max(0, page), totalPages - 1));
      },
      [totalPages]
    );

    const { ref: swipeableRef, ...handlers } = useSwipeable({
      onSwiped: (eventData) => {
        if (eventData.dir === "Left") {
          nextPage();
        }
        if (eventData.dir === "Right") {
          prevPage();
        }
      },
    });

    useEffect(() => {
      if (trackRef.current) {
        setTotalPages(Math.ceil(trackRef.current.scrollWidth / width));
      }
    }, [width, totalSlides]);

    useImperativeHandle(ref, () => ({
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      goToPage,
    }));

    return (
      <div
        {...other}
        {...handlers}
        ref={mergeRefs([containerRef, swipeableRef])}
        style={{ ...style, ...styles.container() }}
        className={`${classPrefix}-container ${className}`}
      >
        <div
          ref={trackRef}
          style={styles.track({ currentPage })}
          className={`${classPrefix}-track`}
        >
          {Children.map(children, (child) =>
            cloneElement(child, {
              style: { ...child.props.style, ...styles.slide() },
            })
          )}
        </div>
      </div>
    );
  }
);
