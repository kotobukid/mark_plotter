import {defineStore} from "pinia";
import {MovementXY, OffsetXY, Point2D} from "../types.ts";

const scaled = (value: number, origin: number, scale: number): number => {
    return (value - origin) * scale + origin;
};

export const useTransformStore = defineStore('transform', {
    state() {
        return {
            x: 0,
            y: 0,
            zoom: 1
        }
    },
    actions: {
        reset_transform() {
            this.x = 0;
            this.y = 0;
            this.zoom = 1;
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
        transformed_offset_movement({movementX, movementY, offsetX, offsetY}: MovementXY & OffsetXY): MovementXY & OffsetXY {
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
            const zoom_next = this.zoom + (up ? 0.1 : - 0.1);

            const scale_ratio = zoom_next / zoom_current;
            console.log(scale_ratio);

            const _x = (this.x - offsetX) * scale_ratio + offsetX;
            const _y = (this.y - offsetY) * scale_ratio + offsetY;

            this.zoom = zoom_next;
            this.x = scaled(this.x, offsetX, scale_ratio);
            this.y = scaled(this.y, offsetY, scale_ratio);
        }
    },
    getters: {
        transform_style(state): string {
            return `transform: translate(${state.x}px, ${state.y}px) scale(${state.zoom});`;
        }
    }
});