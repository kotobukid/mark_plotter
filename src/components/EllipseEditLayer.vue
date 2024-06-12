<script setup lang="ts">
import {useToolStore} from "../stores/tool.ts";
import {useEllipseStore} from "../stores/ellipses.ts";
import {useHistoryManager} from "../composables/history_management.ts";
import {usePlots} from "../composables/plots.ts";
import {computed} from "vue";
import type {Point2D} from "../types.ts";

const store = useEllipseStore();
const {gen_id} = useHistoryManager();
const tool_store = useToolStore();

const layer_offset: Point2D = {
  x: 5,
  y: 5
};

const {
  start,
  end,
  show_preview,
  plotting,
  start_plot,
  cancel_plot,
  move_end
} = usePlots(layer_offset);


const end_plot_ellipse = (e: PointerEvent) => {
  end.value = {x: e.offsetX - layer_offset.x, y: e.offsetY - layer_offset.y};
  tool_store.set('');

  const cx = (start.value.x + end.value.x) / 2;
  const cy = (start.value.y + end.value.y) / 2;
  const rx = Math.abs(start.value.x - end.value.x) / 2;
  const ry = Math.abs(start.value.y - end.value.y) / 2;

  store.create({
    cx,
    cy,
    rx,
    ry,
    id: gen_id()
  });

  show_preview.value = false;
  plotting.value = false;
};

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

</script>

<template lang="pug">
  g.ellipse_edit_layer(
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

</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>