import {defineStore} from "pinia";
import {MovementXY, OffsetXY, Point2D} from "../types.ts";

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
                x: point.x - this.x,
                y: point.y - this.y,
            };
        },
        transformed_offset({offsetX, offsetY}: OffsetXY): OffsetXY {
            return {
                offsetX: offsetX - this.x,
                offsetY: offsetY - this.y,
            };
        },
        transformed_movement({movementX, movementY}: MovementXY): MovementXY {
            return {
                movementX: movementX - this.x,
                movementY: movementY - this.y,
            };
        },
        transformed_offset_movement({movementX, movementY, offsetX, offsetY}: MovementXY & OffsetXY): MovementXY & OffsetXY {
            return {
                movementX: movementX - this.x,
                movementY: movementY - this.y,
                offsetX: offsetX - this.x,
                offsetY: offsetY - this.y,
            };
        },
    },
    getters: {
        transform_style(state): string {
            return `transform: translate(${state.x}px, ${state.y}px);`;
        }
    }
});