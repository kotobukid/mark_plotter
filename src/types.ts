export type Tool = "" | "circle" | "rect" | "line";

export type ImageAndDimensions = {
    dataUrl: string,
    width: number,
    height: number
};

export type Circle = {
    cx: number,
    cy: number,
    r: number
};

export type Rect = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export type Line = {
    x1: number,
    y1: number
    x2: number,
    y2: number
};

export type Point2D = {
    x: number,
    y: number
};
