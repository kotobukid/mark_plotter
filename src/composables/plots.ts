import {computed, nextTick, ref} from "vue";
import type {OffsetXY, Point2D} from "../types.ts";

export const usePlots = (layer_offset: Point2D) => {
    const tr_x = layer_offset.x;
    const tr_y = layer_offset.y;

    const start = ref<Point2D>({x: 0, y: 0});
    const end = ref<Point2D>({x: 0, y: 0});

    const show_preview = ref<boolean>(false);
    const plotting = ref<boolean>(false);
    const start_plot = (e: OffsetXY) => {
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
    const rect_preview = computed(() => {

        const s_gte_x: boolean = start.value.x - end.value.x > 0;
        const s_gte_y: boolean = start.value.y - end.value.y > 0;

        const width = (start.value.x - end.value.x) * (s_gte_x ? 1 : -1);
        const height = (start.value.y - end.value.y) * (s_gte_y ? 1 : -1);
        const x = s_gte_x ? end.value.x : start.value.x;
        const y = s_gte_y ? end.value.y : start.value.y;

        return {
            x, y, width, height
        };
    });

    return {
        start,
        end,
        show_preview,
        plotting,
        start_plot,
        cancel_plot,
        move_end,
        rect_preview
    };
};