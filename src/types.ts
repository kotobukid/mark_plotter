export type Tool = "" | "circle" | "rect" | "line" | "ellipse" | "crop" | 'text';

export type ImageAndDimensions = {
    dataUrl: string,
    width: number,
    height: number
};

export type MyCircle = {
    cx: number,
    cy: number,
    r: number
};

export type MyEllipse = {
    cx: number,
    cy: number,
    rx: number
    ry: number
};

export type MyRect = {
    x: number,
    y: number,
    width: number,
    height: number,
};

export type LabelText = {
    x: number,
    y: number,
    text: string,
};

export type MyLine = {
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
    rects: MyRect[],
    circles: MyCircle[],
    ellipses: MyEllipse[],
    lines: MyLine[]
    texts: LabelText[],
    image_index: number
};
