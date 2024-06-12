<script setup lang="ts">
import {useToolStore} from "../stores/tool.ts";
import {useRectStore} from "../stores/rects.ts";
import {useHistoryManager} from "../composables/history_management.ts";
import {usePlots} from "../composables/plots.ts";
import {computed, inject, nextTick, ref} from "vue";
import type {Point2D} from "../types.ts";

const rect_store = useRectStore();
const {gen_id} = useHistoryManager();
const tool_store = useToolStore();

const layer_offset: Point2D = inject('layer-offset');

const {
  start,
  end,
  show_preview,
  plotting,
  start_plot,
  cancel_plot,
  move_end
} = usePlots(layer_offset);


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

const end_plot_rect = (e: PointerEvent) => {
  end.value = {x: e.offsetX - layer_offset.x, y: e.offsetY - layer_offset.y};
  tool_store.set('');
  const s_gte_x: boolean = start.value.x - end.value.x > 0;
  const s_gte_y: boolean = start.value.y - end.value.y > 0;

  const width = (start.value.x - end.value.x) * (s_gte_x ? 1 : -1);
  const height = (start.value.y - end.value.y) * (s_gte_y ? 1 : -1);
  const x = s_gte_x ? end.value.x : start.value.x;
  const y = s_gte_y ? end.value.y : start.value.y;

  // emits('take-snapshot', () => {
  const r = {x, y, width, height, id: gen_id()};
  rect_store.create(r);

  show_preview.value = false;
  plotting.value = false;
  // });
};

const cancel_plot_handler = () => {
  cancel_plot();
  tool_store.set('');
};

</script>

<template lang="pug">
  g.rect_edit_layer(
    v-if="tool_store.current === 'rect'"
  )
    rect(fill="blue" opacity="0.1" x="-10" y="-10" width="3840" height="2160"
      @pointerdown="start_plot"
      @pointerup="end_plot_rect"
      @pointerleave="cancel_plot_handler"
      @pointermove="move_end"
    )
    g(v-if="show_preview && plotting")
      rect.preview(:x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height" fill="transparent" stroke="red" stroke-width="1")
      circle.preview(:cx="rect_preview.x + rect_preview.width / 2" :cy="rect_preview.y + rect_preview.height / 2" r="3" fill="black" stroke="white" stroke-width="1")

</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";

</style>