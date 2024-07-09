<script setup lang="ts">
import type {Point2D} from "../types.ts";
import {computed, inject} from "vue";
import {useCropStore} from "../stores/crop.ts";
import {useToolStore} from "../stores/tool.ts";
import {usePlots} from "../composables/plots.ts";
import TransformedEventEmitter from "./TransformedEventEmitter.vue";

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
console.log('!')
  // do nothing(not auto release tool to keep preview)
};

const end_crop = (e: PointerEvent) => {
  end.value = {
    x: e.offsetX - layer_offset.x,
    y: e.offsetY - layer_offset.y
  };

  crop_store.set_start(start.value);
  crop_store.set_end(end.value);

  start.value = {x: 0, y: 0};
  end.value = {x: 0, y: 0};

  plotting.value = false;
};

const crop_preview = computed(() => {
  if (plotting.value) {
    return rect_preview.value;
  } else {
    return crop_store.rect_preview;
  }
});
</script>

<template>
  <defs>
    <mask id="masking">
      <rect x="-4000" y="-4000" width="8000px" height="8000px" fill="white"></rect>
      <rect
        :x="crop_preview.x"
        :y="crop_preview.y"
        :width="crop_preview.width"
        :height="crop_preview.height"
        fill="black"
      ></rect>
    </mask>
  </defs>
  <g class="crop_layer" v-if="tool_store.current === 'crop'">
    <transformed-event-emitter
      @pointer-down="start_plot"
      @pointer-up="end_crop"
      @pointer-leave="cancel_plot"
      @pointer-move="move_end"
    >
      <rect class="preview"
            v-if="show_preview"
            x="-4000"
            y="-4000"
            width="8000px"
            height="8000px"
            fill="black"
            opacity="0.2"
            mask="url('#masking')"
            stroke="none" stroke-width="0"
      ></rect>
      <rect class="preview"
            v-if="show_preview"
            :x="crop_preview.x" :y="crop_preview.y" :width="crop_preview.width" :height="crop_preview.height"
            fill="transparent"
            stroke="lightgreen"
            stroke-width="1"
      ></rect>
    </transformed-event-emitter>
  </g>
</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>