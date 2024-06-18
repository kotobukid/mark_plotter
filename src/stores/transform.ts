import {defineStore} from "pinia";
import {MovementXY, OffsetXY, Point2D} from "../types.ts";

const scaled = (value: number, origin: number, scale: number): number => {
    return (value - origin) * scale + origin;
};

type TransformStoreState = {
    x: number,
    y: number,
    zoom_levels: number[],
    zoom_level: number,
    zoom_standard: number
};

type TransformStoreActions = {
    init_zoom_level: (levels: number[], level?: number) => void,
    move_transform: (m: MovementXY) => void,
    set_transform: (p: Point2D) => void,
    transformed: (p: Point2D) => Point2D,
    transformed_offset: (o: OffsetXY) => OffsetXY,
    transformed_movement: (m: MovementXY) => MovementXY,
    transformed_offset_movement: (mo: MovementXY & OffsetXY) => MovementXY & OffsetXY,
    reset_transform: () => void,
    zoom_in: (e: WheelEvent) => void
};

type TransformStoreGetters = {
    zoom: (state: TransformStoreState) => number,
    transform_style: (state: TransformStoreState) => string
};

export const useTransformStore = defineStore<'transform', TransformStoreState, TransformStoreGetters, TransformStoreActions>('transform', {
    state() {
        return {
            x: 0,
            y: 0,
            zoom_level: 0,
            zoom_levels: [
                1
            ],
            zoom_standard: 0
        }
    },
    actions: {
        init_zoom_level(levels: number[], level?: number): void {
            if (!level) {
                level = levels.indexOf(1);
                if (level === -1) {
                    level = Math.floor(levels.length / 2);
                }
            }
            this.zoom_level = level;
            this.zoom_levels = levels;
            this.zoom_standard = level;
        },
        reset_transform() {
            this.x = 0;
            this.y = 0;
            this.zoom_level = this.zoom_standard;
        },
        move_transform({movementX, movementY}: MovementXY) {
            this.x = this.x + movementX;
            this.y = this.y + movementY;
        },
        set_transform(transform: Point2D) {
            this.x = transform.x;
            this.y = transform.y;
        },
        transformed(point: Point2D): Point2D {
            return {
                x: (point.x - this.x) / this.zoom,
                y: (point.y - this.y) / this.zoom
            };
        },
        transformed_offset({offsetX, offsetY}: OffsetXY): OffsetXY {
            return {
                offsetX: (offsetX - this.x) / this.zoom,
                offsetY: (offsetY - this.y) / this.zoom
            };
        },
        transformed_movement({movementX, movementY}: MovementXY): MovementXY {
            return {
                movementX: (movementX - this.x) / this.zoom,
                movementY: (movementY - this.y) / this.zoom
            };
        },
        transformed_offset_movement({
                                        movementX,
                                        movementY,
                                        offsetX,
                                        offsetY
                                    }: MovementXY & OffsetXY): MovementXY & OffsetXY {
            return {
                movementX: (movementX - this.x) / this.zoom,
                movementY: (movementY - this.y) / this.zoom,
                offsetX: (offsetX - this.x) / this.zoom,
                offsetY: (offsetY - this.y) / this.zoom,
            };
        },
        zoom_in({deltaY, offsetX, offsetY}: WheelEvent) {
            const up = deltaY < 0;

            const zoom_current = this.zoom * 1;

            const level_next = up ? Math.min(this.zoom_levels.length - 1, this.zoom_level + 1)
                : Math.max(0, this.zoom_level - 1)

            const zoom_next = this.zoom_levels[level_next];

            const scale_ratio = zoom_next / zoom_current;

            this.x = scaled(this.x, offsetX, scale_ratio);
            this.y = scaled(this.y, offsetY, scale_ratio);
            this.zoom_level = level_next;
        }
    },
    getters: {
        transform_style(state: TransformStoreState): string {
            return `transform: translate(${state.x}px, ${state.y}px) scale(${this.zoom});`;
        },
        zoom(state: TransformStoreState): number {
            return state.zoom_levels[state.zoom_level];
        }
    }
});