<script setup lang="ts">
import {useToolStore} from "../stores/tool.ts";
import {useRectStore} from "../stores/rects.ts";
import {useHistoryManager} from "../composables/history_management.ts";
import {computed, nextTick, ref} from "vue";
import type {Point2D} from "../types.ts";

const rect_store = useRectStore();
const {gen_id} = useHistoryManager();
const tool_store = useToolStore();


const tr_x = 5;
const tr_y = 5;

const start = ref<Point2D>({x: 0, y: 0});
const end = ref<Point2D>({x: 0, y: 0});
const show_preview = ref<boolean>(false);
const plotting = ref<boolean>(false);


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
  end.value = {x: e.offsetX - tr_x, y: e.offsetY - tr_x};
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

const move_end = (e: PointerEvent) => {
  if (plotting.value) {
    end.value = {
      x: e.offsetX - tr_x,
      y: e.offsetY - tr_y
    };
    show_preview.value = true;
  }
};

</script>

<template lang="pug">
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

</template>

<style scoped lang="less">

</style>