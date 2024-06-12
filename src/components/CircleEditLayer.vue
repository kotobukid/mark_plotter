<script setup lang="ts">
import {useCircleStore} from "../stores/circles.ts";
import {useToolStore} from "../stores/tool.ts";
import {usePlots} from "../composables/plots.ts";
import {useHistoryManager} from "../composables/history_management.ts";
import type {Point2D} from "../types.ts";
import {inject, ref} from "vue";

const store = useCircleStore();
const tool_store = useToolStore();
const {gen_id} = useHistoryManager();

const layer_offset: Point2D = inject('layer-offset');

const {
  start_plot,
  cancel_plot,
  show_preview,
  plotting,
  start,
  end,
  move_end
} = usePlots(layer_offset);

const end_plot_circle = (e: PointerEvent) => {
  end.value = {x: e.offsetX - layer_offset.x, y: e.offsetY - layer_offset.y};
  tool_store.set('');

  store.create({
    cx: circle_center.value.x,
    cy: circle_center.value.y,
    r: circle_r.value,
    id: gen_id()
  });

  show_preview.value = false;
  plotting.value = false;
};


const move_end_circle = (e: PointerEvent) => {
  if (plotting.value) {
    end.value = {
      x: e.offsetX - layer_offset.x,
      y: e.offsetY - layer_offset.y
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

const circle_center = ref<Point2D>({x: 0, y: 0});
const circle_r = ref<number>(0);

</script>

<template lang="pug">
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
</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>