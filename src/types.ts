export type Tool = "" | "circle" | "rect" | "line" | "ellipse" | "crop";

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

export type Ellipse = {
    cx: number,
    cy: number,
    rx: number
    ry: number
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

export type Snapshot = {
    rects: Rect[],
    circles: Circle[],
    ellipses: Ellipse[],
    lines: Line[]
};
