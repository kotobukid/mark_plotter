<script setup lang="ts">
import TransformedEventEmitter from "./TransformedEventEmitter.vue";
import {useCircleStore} from "../stores/circles.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import {usePlots} from "../composables/plots.ts";
import type {MovementXY, OffsetXY, Point2D} from "../types.ts";
import {inject, ref} from "vue";
import {useTool} from "../composables/tool.ts";

const store = useCircleStore();
const gen_id = inject('gen-id') as () => number;
const {commit} = useSnapshot();

const layer_offset: Point2D = inject('layer-offset');
const {
  current_tool,
  set_tool,
  circle_option
} = useTool();

const {
  start_plot,
  cancel_plot,
  show_preview,
  plotting,
  start,
  end,
  move_end
} = usePlots(layer_offset);

const _start_plot = (e: OffsetXY) => {
  if (circle_option.value === 'draw_full') {
    start_plot(e);
  } else {

    show_preview.value = true;
    plotting.value = true;

    // draw_half
    circle_r.value = 0;
    circle_center.value = {
      x: e.offsetX,
      y: e.offsetY
    };
    start.value = {
      x: e.offsetX,
      y: e.offsetY
    };
  }
};

const complete_plot_circle = (e: OffsetXY) => {
  end.value = {x: e.offsetX - layer_offset.x, y: e.offsetY - layer_offset.y};
  set_tool('');

  commit(-1);

  store.create({
    cx: circle_center.value.x,
    cy: circle_center.value.y,
    r: circle_r.value,
    id: gen_id()
  });

  show_preview.value = false;
  plotting.value = false;
};


const move_end_circle = (e: MovementXY & OffsetXY) => {
  if (plotting.value) {

    end.value = {
      x: e.offsetX - layer_offset.x,
      y: e.offsetY - layer_offset.y
    };

    if (circle_option.value === 'draw_full') {

      const bb_edge: number = Math.max(Math.abs(start.value.x - end.value.x), Math.abs(start.value.y - end.value.y));
      circle_center.value = {
        x: (start.value.x + end.value.x) / 2,
        y: (start.value.y + end.value.y) / 2,
      };
      circle_r.value = bb_edge / 2;
    } else {
      // draw_half
      circle_r.value = Math.sqrt(
        Math.pow(end.value.x - start.value.x, 2) +
        Math.pow(end.value.y - start.value.y, 2)
      );
    }

    show_preview.value = true;
  }
};

const circle_center = ref<Point2D>({x: 0, y: 0});
const circle_r = ref<number>(0);

</script>

<template lang="pug">
  g.circle_plot_layer(
    v-if="current_tool === 'circle'"
  )
    transformed-event-emitter(
      @pointer-down="_start_plot"
      @pointer-up="complete_plot_circle"
      @pointer-leave="cancel_plot"
      @pointer-move="move_end_circle"
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