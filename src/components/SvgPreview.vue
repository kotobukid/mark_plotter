<script setup lang="ts">
import {computed, nextTick, ref, provide} from "vue";
import {
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
import RectEditLayer from "./RectEditLayer.vue";
import CircleEditLayer from "./CircleEditLayer.vue";
import EllipseEditLayer from "./EllipseEditLayer.vue";
import LineEditLayer from "./LineEditLayer.vue";
import TextEditLayer from "./TextEditLayer.vue";

const tool_store = useToolStore();

const {gen_id} = useHistoryManager();

const layer_offset: Point2D = {
  x: 5,
  y: 5
};

provide('layer-offset', layer_offset);

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

const global_layer_offset = computed(() => {
  return `transform: translate(${layer_offset.x}px, ${layer_offset.y}px);`;
});

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
    g(:style="global_layer_offset")
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

      rect-edit-layer
      circle-edit-layer
      ellipse-edit-layer
      line-edit-layer
      text-edit-layer

      crop-tool-layer
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