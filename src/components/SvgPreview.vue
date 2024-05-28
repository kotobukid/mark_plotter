<script setup lang="ts">
import {computed, nextTick, ref} from "vue";
import {type Tool, type Rect, type Circle, type Point2D, type Line, type Ellipse, type LabelText} from "../types.ts";
import BoxedText from "./BoxedText.vue";

const props = defineProps<{
  tool: Tool,
  image: {
    dataUrl: string,
    width: number,
    height: number
  },
  circles: Circle[],
  rects: Rect[],
  texts: LabelText[],
  lines: Line[],
  ellipses: Ellipse[],
}>();

const emits = defineEmits<{
  (e: 'switch-tool', value: Tool): void,
  (e: 'add-text', value: LabelText): void,
  (e: 'add-circle', value: Circle): void,
  (e: 'add-rect', value: Rect): void,
  (e: 'add-line', value: Line): void,
  (e: 'add-ellipse', value: Ellipse): void,
  (e: 'commit-crop', value: Rect): void,
}>();

const viewBox = computed(() => {
  if (props.image.dataUrl) {
    return `0 0 ${props.image.width + 10} ${props.image.height + 10}`
  } else {
    return '0 0 480 360';
  }
});

const start = ref<Point2D>({x: 0, y: 0});
const end = ref<Point2D>({x: 0, y: 0});
const circle_center = ref<Point2D>({x: 0, y: 0});
const circle_r = ref<number>(0);

const show_preview = ref<boolean>(false);
const plotting = ref<boolean>(false);

const tr_x = 5;
const tr_y = 5;

const start_plot = (e: PointerEvent) => {
  start.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
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
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_x};
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

const end_crop = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
  emits('switch-tool', '');
  const s_gte_x: boolean = start.value.x - end.value.x > 0;
  const s_gte_y: boolean = start.value.y - end.value.y > 0;

  const width = (start.value.x - end.value.x) * (s_gte_x ? 1 : -1);
  const height = (start.value.y - end.value.y) * (s_gte_y ? 1 : -1);
  const x = s_gte_x ? end.value.x : start.value.x;
  const y = s_gte_y ? end.value.y : start.value.y;

  emits('commit-crop', {
    x, y, width, height
  });

  show_preview.value = false;
  plotting.value = false;
};

const end_plot_circle = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
  emits('switch-tool', '');

  emits("add-circle", {
    cx: circle_center.value.x,
    cy: circle_center.value.y,
    r: circle_r.value
  });

  show_preview.value = false;
  plotting.value = false;
};

const end_plot_ellipse = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
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
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
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

const end_plot_text = (e: PointerEvent) => {
  const text: string = (prompt('') || '').trim();
  if (text) {
    emits('add-text', {
      text,
      x: e.offsetX - tr_x,
      y: e.offsetY - tr_y
    });
  }

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

const move_end_circle = (e: PointerEvent) => {
  if (plotting.value) {
    end.value = {
      x: e.offsetX - tr_x,
      y: e.offsetY - tr_y
    };

    const bb_edge: number = Math.max(Math.abs(start.value.x - end.value.x), Math.abs(start.value.y - end.value.y));
    circle_center.value = {
      x: (start.value.x + end.value.x) / 2,
      y: (start.value.y + end.value.y) / 2,
    };
    circle_r.value = bb_edge / 2;

    show_preview.value = true;
  }
};

const shift_text_preview = (e: PointerEvent) => {
  start.value = {
    x: e.offsetX - tr_x,
    y: e.offsetY - tr_y
  };
  // show_preview.value = true;
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

const cursor_pos = ref<Point2D>({x: -1, y: -1});

const cursor_move = (e: PointerEvent) => {
  cursor_pos.value = {
    x: e.offsetX,
    y: e.offsetY
  };
};

const show_cursor = ref(false);

const cursor_transform = computed(() => {
  return `transform: translate(${cursor_pos.value.x}px, ${cursor_pos.value.y}px);`;
});

const hide_cursor = (hide: boolean) => {
  show_cursor.value = !hide;
};

</script>

<template lang="pug">
  svg#svg_main(xmlns="http://www.w3.org/2000/svg" :viewBox="viewBox" :width="props.image.width + 10" :height="props.image.height + 10"
    @pointermove="cursor_move"
    @pointerleave="hide_cursor(true)"
    @pointerenter="hide_cursor(false)"
  )
    defs
      marker#marker-1(viewBox="0 0 100 78.542" overflow="visible" orient="auto" refX="19.39" refY="19.39")
        path(d="M -28.08 4.983 L 300 -207.988 L 300 217.954 L -28.08 4.983 Z" style="fill: rgb(248, 0, 0); transform-origin: -27.973px 5.758px;")

      filter#box-shadow1(color-interpolation-filters="sRGB" x="-50%" y="-50%" width="200%" height="200%")
        title Drop shadow
        feGaussianBlur(in="SourceAlpha" stdDeviation="5" result="gaussian-blur-0")
        feOffset(dx="4" dy="4" in="gaussian-blur-0" result="offset-0")
        feComponentTransfer(result="offsetblur" in="offset-0")
          feFuncA#spread-ctrl(type="linear" slope="0.66")
        feFlood(flood-color="rgba(0,0,0,1)" result="flood-0")
        feComposite(in2="offsetblur" operator="in" in="flood-0" result="composite-0")
        feMerge(result="merge-0")
          feMergeNode(in="composite-0")
          feMergeNode(in="SourceGraphic")
    g(style="transform: translate(5px, 5px);")
      rect.background(
        fill="red"
        stroke="transparent"
        x="0"
        y="0"
        :width="props.image.width"
        :height="props.image.height"
        style="filter: url('#box-shadow1');"
      )
      image.main_image(:href="props.image.dataUrl" :width="props.image.width" :height="props.image.height")
      g.rects
        rect(v-for="r in rects" :x="r.x" :y="r.y" :width="r.width" :height="r.height" fill="transparent" stroke="red" stroke-width="2")
      g.circles
        circle(v-for="c in circles" :cx="c.cx" :cy="c.cy" :r="c.r" fill="transparent" stroke="red" stroke-width="2")
      g.ellipses
        ellipse(v-for="e in ellipses" :cx="e.cx" :cy="e.cy" :rx="e.rx" :ry="e.ry" fill="transparent" stroke="red" stroke-width="2")
      g.lines
        line.line_arrow(v-for="l in lines" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" fill="transparent" stroke="red" stroke-width="2" style="marker-start: url(\"#marker-1\");")
      g.texts
        BoxedText(v-for="t in texts" :label_text="t")
      g.rect_plot_layer(
        v-if="tool === 'rect'"
      )
        rect(fill="blue" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_rect"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        rect.preview(v-if="show_preview && plotting" :x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height" fill="transparent" stroke="red" stroke-width="1")
      g.circle_plot_layer(
        v-if="tool === 'circle'"
      )
        rect(fill="red" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_circle"
          @pointerleave="cancel_plot"
          @pointermove="move_end_circle"
        )
        circle.preview(v-if="show_preview && plotting" :cx="circle_center.x" :cy="circle_center.y" :r="circle_r" fill="transparent" stroke="red" stroke-width="1")
        circle.preview(v-if="show_preview && plotting" :cx="circle_center.x" :cy="circle_center.y" r="2" fill="black" stroke="transparent" stroke-width="0")
        circle.preview(v-if="show_preview && plotting" :cx="start.x" :cy="start.y" fill="black" stroke-width="0" stroke="transparent" r="2")
        circle.preview(v-if="show_preview && plotting" :cx="end.x" :cy="end.y" fill="black" stroke-width="0" stroke="transparent" r="2")
      g.ellipse_plot_layer(
        v-if="tool === 'ellipse'"
      )
        rect(fill="orange" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_ellipse"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        ellipse.preview(v-if="show_preview && plotting" :cx="ellipse_preview.cx" :cy="ellipse_preview.cy" :rx="ellipse_preview.rx" :ry="ellipse_preview.ry" fill="transparent" stroke="red" stroke-width="1")
        circle.preview(v-if="show_preview && plotting" :cx="start.x" :cy="start.y" fill="black" stroke-width="0" stroke="transparent" r="2")
        circle.preview(v-if="show_preview && plotting" :cx="end.x" :cy="end.y" fill="black" stroke-width="0" stroke="transparent" r="2")

      g.line_plot_layer(
        v-if="tool === 'line'"
      )
        rect(fill="green" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_line"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        line.preview(v-if="show_preview && plotting" :x1="start.x" :y1="start.y" :x2="end.x" :y2="end.y" stroke="red" stroke-width="2" fill="none"  style="marker-start: url(\"#marker-1\");")
      g.text_plot_layer(
        v-if="tool === 'text'"
      )
        rect(fill="orange" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_text"
          @pointerleave="cancel_plot"
          @pointermove="shift_text_preview"
        )
        rect.preview(:x="start.x - 10" :y="start.y - 33" width="120" height="42" stroke="red" border-width="1" fill="white" opacity="0.5")
      g.crop_layer(
        v-if="tool === 'crop'"
      )
        rect(fill="black" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_crop"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        rect.preview(v-if="show_preview && plotting" :x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height" fill="transparent" stroke="red" stroke-width="1")

      rect.frame(v-if="props.image.dataUrl" x="1" y="1" :width="props.image.width - 2" :height="props.image.height - 2" fill="transparent" stroke-width="1" stroke="black")
    g.cursor_pos(:style="cursor_transform" v-if="show_cursor")
      line(x1="0" y1="30" x2="0" y2="15")
      line(x1="0" y1="-30" x2="0" y2="-15")
      line(x1="30" y1="0" x2="15" y2="0")
      line(x1="-30" y1="0" x2="-15" y2="0")
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

g.cursor_pos {
  pointer-events: none;

  line {
    fill: none;
    stroke-width: 1px;
    stroke: grey;
  }
}
</style>