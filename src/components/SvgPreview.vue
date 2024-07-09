<script setup lang="ts">
import {computed, ref, inject, provide} from "vue";
import {
  type MyRect,
  type MyCircle,
  type Point2D,
  type MyLine,
  type MyEllipse,
  type LabelText
} from "../types.ts";
import BoxedText from "./BoxedText.vue";
import CropToolLayer from "./CropToolLayer.vue";
import CircleLayer from "./CircleLayer.vue";
import {useToolStore} from "../stores/tool.ts";
import {useRectStore} from "../stores/rects.ts";
import {useImageStore} from "../stores/images.ts";
import EllipseLayer from "./EllipseLayer.vue";
import LineLayer from "./LineLayer.vue";
import TextLayer from "./TextLayer.vue";
import RectLayer from "./RectLayer.vue";
import RectEditLayer from "./RectEditLayer.vue";
import CircleEditLayer from "./CircleEditLayer.vue";
import EllipseEditLayer from "./EllipseEditLayer.vue";
import LineEditLayer from "./LineEditLayer.vue";
import TextEditLayer from "./TextEditLayer.vue";
import PanLayer from "./PanLayer.vue";
import ScaleEventCatcher from "./VoidLayer.vue";

import {useTransformStore} from "../stores/transform.ts";
import {useTool} from "../composables/tool.ts";
import VoidLayer from "./VoidLayer.vue";
import OmitOnSave from "./OmitOnSave.vue";

const image_store = useImageStore();
const transform_store = useTransformStore();

const layer_offset = inject('layer-offset') as Point2D;

const emits = defineEmits<{
  (e: 'commit-crop', value: MyRect): void,
}>();

const viewBox = computed(() => {
  if (image_store.image.dataUrl) {
    return `0 0 ${image_store.image.width + 10} ${image_store.image.height + 10}`
  } else {
    return '0 0 480 360';
  }
});

const cursor_pos = ref<Point2D>({x: -1, y: -1});

const {current_tool, override} = useTool();

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

const show_sight = computed(() => {
  return show_cursor && [
    'circle',
    'rect',
    'ellipse',
    'text',
    'line',
    'crop'
  ].includes(current_tool.value)
});

const wheeled = (e: WheelEvent) => {
  transform_store.zoom_in(e);
};

const panning = ref(false);
provide('panning', panning);

const pointer_down = (e: PointerEvent) => {
  if (e.button === 1) { // ホイール
    override('pan');
    panning.value = true;
  }
};
const pointer_up = (e: PointerEvent) => {
  if (e.button === 1) {
    panning.value = false;
    override('');
  }
}
</script>

<template lang="pug">
  svg#svg_main(xmlns="http://www.w3.org/2000/svg" v-if="image_store.image.dataUrl" :viewBox="viewBox" :width="image_store.image.width + 10" :height="image_store.image.height + 10"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    @pointerdown="pointer_down"
    @pointerup="pointer_up"
    @pointermove="cursor_move"
    @pointerleave="hide_cursor(true)"
    @pointerenter="hide_cursor(false)"
  )
    defs
      marker#marker-1(viewBox="0 0 100 78.542" overflow="visible" orient="auto" refX="19.39" refY="19.39")
        path(d="M -28.08 4.983 L 300 -207.988 L 300 217.954 L -28.08 4.983 Z" style="fill: rgb(248, 0, 0); transform-origin: -27.973px 5.758px;")
      marker#marker-2(viewBox="0 0 100 78.542" overflow="visible" orient="auto" refX="19.39" refY="19.39")
        path(d="M 58.2 14.566 L 386.28 -198.405 L 386.28 227.537 L 58.2 14.566 Z" style="fill: rgb(248, 0, 0); transform-origin: 58.307px 15.341px;" transform="matrix(-1, 0, 0, -1, 0.000003, 0)")

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
    g(:style="transform_store.transform_style")
      g(:style="global_layer_offset")
        image.main_image(
          :xlink:href="image_store.image.dataUrl" :width="image_store.image.width" :height="image_store.image.height"
          style="filter: url(#box-shadow1);"
          :key="image_store.image.id"
        )
        OmitOnSave
          void-layer

        rect-layer
        circle-layer
        ellipse-layer
        line-layer
        text-layer

        OmitOnSave
          rect-edit-layer
          circle-edit-layer
          ellipse-edit-layer
          line-edit-layer
          text-edit-layer

          crop-tool-layer
    OmitOnSave
      pan-layer(@wheeled="wheeled")
      g.cursor_pos(:style="cursor_transform" v-if="show_sight")
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