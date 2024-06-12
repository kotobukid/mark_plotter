import {nextTick, ref} from "vue";
import type {Point2D} from "../types.ts";

export const usePlots = (layer_offset: Point2D) => {
    const tr_x = layer_offset.x;
    const tr_y = layer_offset.y;

    const start = ref<Point2D>({x: 0, y: 0});
    const end = ref<Point2D>({x: 0, y: 0});

    const show_preview = ref<boolean>(false);
    const plotting = ref<boolean>(false);
    const start_plot = (e: PointerEvent) => {
        start.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
        end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
        nextTick(() => {
            show_preview.value = true;
            plotting.value = true;
        }).then();
    };

    const cancel_plot = () => {
        show_preview.value = false;
        plotting.value = false;
    };

    const move_end = (e: PointerEvent) => {
        if (plotting.value) {
            end.value = {
                x: e.offsetX - tr_x,
                y: e.offsetY - tr_y
            };
            show_preview.value = true;
        }
    };

    return {
        start,
        end,
        show_preview,
        plotting,
        start_plot,
        cancel_plot,
        move_end
    };
};