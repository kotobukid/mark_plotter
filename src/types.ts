export type ElementType = 'rect' | 'circle' | 'ellipse' | 'line' | 'text';
export type Tool = "" | "erase" | "circle" | "rect" | "line" | "ellipse" | "crop" | 'text' | 'edit' | 'pan';

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

export type ArrowDirection = 'forward' | 'both' | 'none';

export type MyLine = {
    x1: number,
    y1: number
    x2: number,
    y2: number,
    arrow: ArrowDirection,
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

export type ApplicationImage = {
    image: ImageAndDimensions,
    circles: MyCircle[],
    rects: MyRect[],
    ellipses: MyEllipse[],
    lines: MyLine[],
    texts: LabelText[],
    filename: string
};

export type OffsetXY = {
    offsetX: number,
    offsetY: number
};

export type MovementXY = {
    movementX: number,
    movementY: number
};

