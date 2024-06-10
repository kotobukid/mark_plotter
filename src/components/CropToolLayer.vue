<script setup lang="ts">
import type {Tool} from "../types.ts";
import {computed, nextTick, ref} from "vue";
import {useCropStore} from "../stores/crop.ts";

const crop_store = useCropStore();

const props = defineProps<{
  tool: Tool,
}>();

const emits = defineEmits<{
  (e: 'switch-tool', value: Tool): void,
}>();

const plotting = ref<boolean>(false);

const tr_x = 5;
const tr_y = 5;

const start_plot = (e: PointerEvent) => {
  crop_store.set_start({x: e.offsetX - tr_x, y: e.offsetY - tr_y});
  crop_store.set_end({x: e.offsetX - tr_x, y: e.offsetY - tr_y});
  nextTick(() => {
    crop_store.show_preview = true;
    plotting.value = true;
  });
};

const cancel_plot = () => {
  emits('switch-tool', '');
};

const move_end = (e: PointerEvent) => {
  if (plotting.value) {
    crop_store.set_end({
      x: e.offsetX - tr_x,
      y: e.offsetY - tr_y
    });
    crop_store.show_preview = true;
  }
};
const end_crop = (e: PointerEvent) => {
  crop_store.set_end({
    x: e.offsetX - tr_x, y: e.offsetY - tr_y
  });

  emits('switch-tool', '');
  plotting.value = false;
};

const rect_preview = computed(() => {
  const start = crop_store.start;
  const end = crop_store.end;

  const s_gte_x: boolean = start.x - end.x > 0;
  const s_gte_y: boolean = start.y - end.y > 0;

  const width = (start.x - end.x) * (s_gte_x ? 1 : -1);
  const height = (start.y - end.y) * (s_gte_y ? 1 : -1);
  const x = s_gte_x ? end.x : start.x;
  const y = s_gte_y ? end.y : start.y;

  return {
    x, y, width, height
  };
});

</script>

<template>
  <teleport to="#additional_defs">
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
  </teleport>
  <g class="crop_layer">
    <rect fill="black" opacity="0.1" x="0" y="0" width="1920" height="1080"
          @pointerdown="start_plot"
          @pointerup="end_crop"
          @pointerleave="cancel_plot"
          @pointermove="move_end"
    ></rect>
    <rect class="preview"
          v-if="crop_store.show_preview"
          x="-10"
          y="-10"
          width="2000px"
          height="2000px"
          fill="black"
          opacity="0.2"
          mask="url('#masking')"
          stroke="green" stroke-width="1"
    ></rect>
  </g>
</template>

<style scoped lang="less">
.preview {
  pointer-events: none;
}
</style>