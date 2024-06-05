export type Tool = "" | "circle" | "rect" | "line" | "ellipse" | "crop" | 'text';

export type ImageAndDimensions = {
    dataUrl: string,
    width: number,
    height: number,
    id: number
};

export type MyCircle = {
    cx: number,
    cy: number,
    r: number,
    id: number
};

export type MyEllipse = {
    cx: number,
    cy: number,
    rx: number
    ry: number,
    id: number
};

export type MyRect = {
    x: number,
    y: number,
    width: number,
    height: number,
    id: number
};

export type LabelText = {
    x: number,
    y: number,
    text: string,
    id: number
};

export type MyLine = {
    x1: number,
    y1: number
    x2: number,
    y2: number,
    id: number
};

export type Point2D = {
    x: number,
    y: number
};

export type Snapshot = {
    rects: MyRect[],
    circles: MyCircle[],
    ellipses: MyEllipse[],
    lines: MyLine[]
    texts: LabelText[],
    image_index: number
};