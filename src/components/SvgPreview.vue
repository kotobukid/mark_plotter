<script setup lang="ts">
import {computed, nextTick, ref} from "vue";
import {type Tool, type Rect, type Circle, type Point2D, type Line, type Ellipse} from "../types.ts";

const props = defineProps<{
    tool: Tool,
    image: {
        dataUrl: string,
        width: number,
        height: number
    },
    circles: Circle[],
    rects: Rect[],
    lines: Line[],
    ellipses: Ellipse[],
}>();

const emits = defineEmits<{
    (e: 'switch-tool', value: Tool): void,
    (e: 'add-circle', value: Circle): void,
    (e: 'add-rect', value: Rect): void,
    (e: 'add-line', value: Line): void,
    (e: 'add-ellipse', value: Ellipse): void,
}>();

const viewBox = computed(() => {
    if (props.image.dataUrl) {
        return `0 0 ${props.image.width} ${props.image.height}`
    } else {
        return '0 0 480 360';
    }
});

const start = ref<Point2D>({x: 0, y: 0});
const end = ref<Point2D>({x: 0, y: 0});

const show_preview = ref<boolean>(false);
const plotting = ref<boolean>(false);

const start_plot = (e: PointerEvent) => {
    start.value = {x: e.offsetX, y: e.offsetY};
    nextTick(() => {
        show_preview.value = true;
        plotting.value = true;
    });
};

const cancel_plot = () => {
    show_preview.value = false;
    plotting.value = false;
    emits('switch-tool', '');
};

const end_plot_rect = (e: PointerEvent) => {
    end.value = {x: e.offsetX, y: e.offsetY};
    emits('switch-tool', '');
    const s_gte_x: boolean = start.value.x - end.value.x > 0;
    const s_gte_y: boolean = start.value.y - end.value.y > 0;

    const width = (start.value.x - end.value.x) * (s_gte_x ? 1 : -1);
    const height = (start.value.y - end.value.y) * (s_gte_y ? 1 : -1);
    const x = s_gte_x ? end.value.x : start.value.x;
    const y = s_gte_y ? end.value.y : start.value.y;

    emits('add-rect', {
        x, y, width, height
    });

    show_preview.value = false;
    plotting.value = false;
};

const end_plot_circle = (e: PointerEvent) => {
    end.value = {x: e.offsetX, y: e.offsetY};
    emits('switch-tool', '');

    const r = Math.floor(Math.sqrt(
        Math.pow(end.value.x - start.value.x, 2)
        + Math.pow(end.value.y - start.value.y, 2)));
    emits("add-circle", {
        cx: start.value.x,
        cy: start.value.y,
        r
    });

    show_preview.value = false;
    plotting.value = false;
};

const end_plot_ellipse = (e: PointerEvent) => {
    end.value = {x: e.offsetX, y: e.offsetY};
    emits('switch-tool', '');

    const cx = (start.value.x + end.value.x) / 2;
    const cy = (start.value.y + end.value.y) / 2;
    const rx = Math.abs(start.value.x - end.value.x) / 2;
    const ry = Math.abs(start.value.y - end.value.y) / 2;
    emits('add-ellipse', {
        cx,
        cy,
        rx,
        ry
    });

    show_preview.value = false;
    plotting.value = false;
};

const end_plot_line = (e: PointerEvent) => {
    end.value = {x: e.offsetX, y: e.offsetY};
    emits('switch-tool', '');

    emits("add-line", {
        x1: start.value.x,
        y1: start.value.y,
        x2: end.value.x,
        y2: end.value.y,
    });

    show_preview.value = false;
    plotting.value = false;
};

const move_end = (e: PointerEvent) => {
    if (plotting) {
        end.value = {
            x: e.offsetX,
            y: e.offsetY
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

const circle_preview = computed(() => {
    const r = Math.floor(Math.sqrt(
        Math.pow(end.value.x - start.value.x, 2)
        + Math.pow(end.value.y - start.value.y, 2)));
    return {
        cx: start.value.x,
        cy: start.value.y,
        r
    };
});

const ellipse_preview = computed(() => {
    const cx = (start.value.x + end.value.x) / 2;
    const cy = (start.value.y + end.value.y) / 2;
    const rx = Math.abs(start.value.x - end.value.x) / 2;
    const ry = Math.abs(start.value.y - end.value.y) / 2;
    return {
        cx,
        cy,
        rx,
        ry
    };
});
</script>

<template lang="pug">
    svg#svg_main(xmlns="http://www.w3.org/2000/svg" version="1.1" :viewBox="viewBox" @click="clicked" :width="props.image.width" :height="props.image.height")
        defs
            marker#marker-1(viewBox="0 0 100 78.542" overflow="visible" orient="auto" refX="19.39" refY="19.39")
                path(d="M -28.08 4.983 L 300 -207.988 L 300 217.954 L -28.08 4.983 Z" style="fill: rgb(248, 0, 0); transform-origin: -27.973px 5.758px;")
        image.main_image(:href="props.image.dataUrl" :width="props.image.width" :height="props.image.height")
        g.rects
            rect(v-for="r in rects" :x="r.x" :y="r.y" :width="r.width" :height="r.height" fill="transparent" stroke="red" stroke-width="1")
        g.circles
            circle(v-for="c in circles" :cx="c.cx" :cy="c.cy" :r="c.r" fill="transparent" stroke="red" stroke-width="1")
        g.ellipses
            ellipse(v-for="e in ellipses" :cx="e.cx" :cy="e.cy" :rx="e.rx" :ry="e.ry" fill="transparent" stroke="red" stroke-width="1")
        g.lines
            line.line_arrow(v-for="l in lines" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" fill="transparent" stroke="red" stroke-width="2" style="marker-start: url(\"#marker-1\");")
        g.rect_plot_layer(
            v-if="tool === 'rect'"
        )
            rect(fill="blue" opacity="0.1" x="0" y="0" width="1920" height="1080"
                @pointerdown="start_plot"
                @pointerup="end_plot_rect"
                @pointerleave="cancel_plot"
                @pointermove="move_end"
            )
            rect.preview(v-if="show_preview" :x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height" fill="transparent" stroke="red" stroke-width="1")
        g.circle_plot_layer(
            v-if="tool === 'circle'"
        )
            rect(fill="red" opacity="0.1" x="0" y="0" width="1920" height="1080"
                @pointerdown="start_plot"
                @pointerup="end_plot_circle"
                @pointerleave="cancel_plot"
                @pointermove="move_end"
            )
            circle.preview(v-if="show_preview" :cx="circle_preview.cx" :cy="circle_preview.cy" :r="circle_preview.r" fill="transparent" stroke="red" stroke-width="1")
        g.ellipse_plot_layer(
            v-if="tool === 'ellipse'"
        )
            rect(fill="red" opacity="0.1" x="0" y="0" width="1920" height="1080"
                @pointerdown="start_plot"
                @pointerup="end_plot_ellipse"
                @pointerleave="cancel_plot"
                @pointermove="move_end"
            )
            ellipse.preview(v-if="show_preview" :cx="ellipse_preview.cx" :cy="ellipse_preview.cy" :rx="ellipse_preview.rx" :ry="ellipse_preview.ry" fill="transparent" stroke="red" stroke-width="1")
        g.line_plot_layer(
            v-if="tool === 'line'"
        )
            rect(fill="green" opacity="0.1" x="0" y="0" width="1920" height="1080"
                @pointerdown="start_plot"
                @pointerup="end_plot_line"
                @pointerleave="cancel_plot"
                @pointermove="move_end"
            )
            line.preview(v-if="show_preview" :x1="start.x" :y1="start.y" :x2="end.x" :y2="end.y" stroke="red" stroke-width="2" fill="none"  style="marker-start: url(\"#marker-1\");")
        rect.frame(v-if="props.image.dataUrl" x="1" y="1" :width="props.image.width - 2" :height="props.image.height - 2" fill="transparent" stroke-width="1" stroke="black")
</template>

<style scoped>
svg {
    outline: 1px solid grey;
    user-select: none;
}

.preview {
    pointer-events: none;
}

rect.frame {
    pointer-events: none;
}
</style>