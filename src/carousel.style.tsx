import { CSSProperties } from "react";

type Style<P = undefined> = P extends undefined
  ? () => CSSProperties
  : (props: P) => CSSProperties;

export const container: Style = () => ({
  overflow: "hidden",
});

export const track: Style<{ currentPage: number }> = (props) => ({
  display: "flex",
  transform: `translateX(-${props.currentPage * 100}%)`,
});

export const item: Style = () => ({
  flexShrink: 0,
});
