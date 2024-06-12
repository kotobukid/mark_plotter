<script setup lang="ts">
import type {Point2D} from "../types.ts";
import {inject} from "vue";
import {useCropStore} from "../stores/crop.ts";
import {useToolStore} from "../stores/tool.ts";
import {usePlots} from "../composables/plots.ts";

const layer_offset: Point2D = inject('layer-offset');

const crop_store = useCropStore();
const tool_store = useToolStore();

const {
  start,
  end,
  show_preview,
  plotting,
  start_plot,
  // cancel_plot,
  move_end,
  rect_preview
} = usePlots(layer_offset);

const cancel_plot = () => {
  // do nothing(not auto release tool to keep preview)
};

const end_crop = (e: PointerEvent) => {
  end.value = {
    x: e.offsetX - layer_offset.x,
    y: e.offsetY - layer_offset.y
  };

  crop_store.set_start(start.value);
  crop_store.set_end(end.value);

  plotting.value = false;
};

</script>

<template>
  <defs>
    <mask id="masking">
      <rect x="-10" y="-10" width="2000px" height="2000px" fill="white"></rect>
      <rect
        :x="rect_preview.x"
        :y="rect_preview.y"
        :width="rect_preview.width"
        :height="rect_preview.height"
        fill="black"
      ></rect>
    </mask>
  </defs>
  <g class="crop_layer" v-if="tool_store.current === 'crop'">
    <rect fill="black" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_crop"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
    ></rect>
    <rect class="preview"
          v-if="show_preview"
          x="-10"
          y="-10"
          width="2000px"
          height="2000px"
          fill="black"
          opacity="0.2"
          mask="url('#masking')"
          stroke="none" stroke-width="0"
    ></rect>
    <rect class="preview"
          v-if="show_preview"
          :x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height"
          fill="transparent"
          stroke="lightgreen"
          stroke-width="1"
    ></rect>
  </g>
</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>