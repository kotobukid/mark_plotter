<script setup lang="ts">
import {computed, nextTick, ref} from "vue";
import {
  type Tool,
  type MyRect,
  type MyCircle,
  type Point2D,
  type MyLine,
  type MyEllipse,
  type LabelText,
  type EraseTarget
} from "../types.ts";
import BoxedText from "./BoxedText.vue";
import CropToolLayer from "./CropToolLayer.vue";
import CircleLayer from "./CircleLayer.vue";
import {useHistoryManager} from "../composables/history_management.ts";
import {useToolStore} from "../stores/tool.ts";
import {useRectStore} from "../stores/rects.ts";
import EllipseLayer from "./EllipseLayer.vue";
import LineLayer from "./LineLayer.vue";
import TextLayer from "./TextLayer.vue";
import RectLayer from "./RectLayer.vue";

const tool_store = useToolStore();
const rect_store = useRectStore();

const {gen_id} = useHistoryManager();

const props = defineProps<{
  image: {
    dataUrl: string,
    width: number,
    height: number,
    id: number
  },
  texts: LabelText[],
}>();

const emits = defineEmits<{
  (e: 'add-text', value: LabelText): void,
  (e: 'add-circle', value: MyCircle): void,
  (e: 'take-snapshot', value: Function): void,
  (e: 'add-line', value: MyLine): void,
  (e: 'add-ellipse', value: MyEllipse): void,
  (e: 'commit-crop', value: MyRect): void,
  (e: 'erase-element', value: EraseTarget): void,
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
  tool_store.set('')
};

const end_plot_rect = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_x};
  tool_store.set('');
  const s_gte_x: boolean = start.value.x - end.value.x > 0;
  const s_gte_y: boolean = start.value.y - end.value.y > 0;

  const width = (start.value.x - end.value.x) * (s_gte_x ? 1 : -1);
  const height = (start.value.y - end.value.y) * (s_gte_y ? 1 : -1);
  const x = s_gte_x ? end.value.x : start.value.x;
  const y = s_gte_y ? end.value.y : start.value.y;

  emits('take-snapshot', () => {
    const r = {x, y, width, height, id: gen_id()};
    rect_store.create(r);

    show_preview.value = false;
    plotting.value = false;
  });
};

const end_plot_circle = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
  tool_store.set('');

  emits("add-circle", {
    cx: circle_center.value.x,
    cy: circle_center.value.y,
    r: circle_r.value,
    id: -1
  });

  show_preview.value = false;
  plotting.value = false;
};

const end_plot_ellipse = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
  tool_store.set('');

  const cx = (start.value.x + end.value.x) / 2;
  const cy = (start.value.y + end.value.y) / 2;
  const rx = Math.abs(start.value.x - end.value.x) / 2;
  const ry = Math.abs(start.value.y - end.value.y) / 2;
  emits('add-ellipse', {
    cx,
    cy,
    rx,
    ry,
    id: -1
  });

  show_preview.value = false;
  plotting.value = false;
};

const end_plot_line = (e: PointerEvent) => {
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_y};
  tool_store.set('');

  emits("add-line", {
    x1: start.value.x,
    y1: start.value.y,
    x2: end.value.x,
    y2: end.value.y,
    id: -1
  });

  show_preview.value = false;
  plotting.value = false;
};

const end_plot_text = (e: PointerEvent) => {
  show_preview.value = false;
  show_cursor.value = false;
  setTimeout(() => {
    const text: string = (prompt('\\nで改行', '') || '').trim();
    if (text) {
      tool_store.set('')
      emits('add-text', {
        text,
        x: e.offsetX - tr_x,
        y: e.offsetY - tr_y,
        id: -1
      });
    }
    plotting.value = false;
  }, 100);
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
  svg#svg_main(xmlns="http://www.w3.org/2000/svg" v-if="props.image.dataUrl" :viewBox="viewBox" :width="props.image.width + 10" :height="props.image.height + 10"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    @pointermove="cursor_move"
    @pointerleave="hide_cursor(true)"
    @pointerenter="hide_cursor(false)"
  )
    defs
      marker#marker-1(viewBox="0 0 100 78.542" overflow="visible" orient="auto" refX="19.39" refY="19.39")
        path(d="M -28.08 4.983 L 300 -207.988 L 300 217.954 L -28.08 4.983 Z" style="fill: rgb(248, 0, 0); transform-origin: -27.973px 5.758px;")

      filter#box-shadow1(color-interpolation-filters="sRGB" x="-50%" y="-50%" width="200%" height="200%")
        feGaussianBlur(in="SourceAlpha" stdDeviation="4")
        feOffset(dx="1" dy="1")
        feComponentTransfer(result="offsetblur")
          feFuncA#spread-ctrl(type="linear" slope="1")
        feFlood(flood-color="#000")
        feComposite(in2="offsetblur" operator="in")
        feMerge
          feMergeNode
          feMergeNode(in="SourceGraphic")
    defs#additional_defs
    g(style="transform: translate(5px, 5px);")
      image.main_image(
        :xlink:href="props.image.dataUrl" :width="props.image.width" :height="props.image.height"
        style="filter: url(#box-shadow1);"
        :key="props.image.id"
      )
      rect-layer
      circle-layer
      ellipse-layer
      line-layer
      text-layer

      g.rect_plot_layer(
        v-if="tool_store.current === 'rect'"
      )
        rect(fill="blue" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_rect"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        g(v-if="show_preview && plotting")
          rect.preview(:x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height" fill="transparent" stroke="red" stroke-width="1")
          circle.preview(:cx="rect_preview.x + rect_preview.width / 2" :cy="rect_preview.y + rect_preview.height / 2" r="3" fill="black" stroke="white" stroke-width="1")

      g.circle_plot_layer(
        v-if="tool_store.current === 'circle'"
      )
        rect(fill="red" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_circle"
          @pointerleave="cancel_plot"
          @pointermove="move_end_circle"
        )
        g(v-if="show_preview && plotting")
          circle.preview(:cx="circle_center.x" :cy="circle_center.y" :r="circle_r" fill="transparent" stroke="red" stroke-width="1")
          circle.preview(:cx="circle_center.x" :cy="circle_center.y" r="3" fill="black" stroke="white" stroke-width="1")
          circle.preview(:cx="start.x" :cy="start.y" fill="black" stroke-width="0" stroke="transparent" r="2")
          circle.preview(:cx="end.x" :cy="end.y" fill="black" stroke-width="0" stroke="transparent" r="2")
      g.ellipse_plot_layer(
        v-if="tool_store.current === 'ellipse'"
      )
        rect(fill="orange" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_ellipse"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        g(v-if="show_preview && plotting")
          ellipse.preview(:cx="ellipse_preview.cx" :cy="ellipse_preview.cy" :rx="ellipse_preview.rx" :ry="ellipse_preview.ry" fill="transparent" stroke="red" stroke-width="1")
          circle.preview(:cx="start.x" :cy="start.y" fill="black" stroke-width="0" stroke="transparent" r="2")
          circle.preview(:cx="end.x" :cy="end.y" fill="black" stroke-width="0" stroke="transparent" r="2")
          circle.preview(:cx="(end.x + start.x) / 2" :cy="(end.y + start.y) / 2" fill="black" stroke-width="1" stroke="white" r="3")
      g.line_plot_layer(
        v-if="tool_store.current === 'line'"
      )
        rect(fill="green" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_line"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
        )
        line.preview(v-if="show_preview && plotting" :x1="start.x" :y1="start.y" :x2="end.x" :y2="end.y" stroke="red" stroke-width="2" fill="none"  style="marker-start: url(\"#marker-1\");")
      g.text_plot_layer(
        v-if="tool_store.current === 'text'"
      )
        rect(fill="orange" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_plot_text"
          @pointerleave="cancel_plot"
          @pointermove="shift_text_preview"
        )
        rect.preview(:x="start.x - 10" :y="start.y - 33" width="120" height="42" stroke="red" stroke-width="1" fill="white" opacity="0.5")
      crop-tool-layer(v-if="tool_store.current === 'crop'" :tool="tool_store.current")
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