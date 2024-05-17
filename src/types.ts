export type Tool = "" | "circle" | "rect";

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

export type Point2D = {
    x: number,
    y: number
};
