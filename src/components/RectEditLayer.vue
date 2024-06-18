<script setup lang="ts">
import TransformedEventCatcher from "./TransformedEventCatcher.vue";
import {useToolStore} from "../stores/tool.ts";
import {useRectStore} from "../stores/rects.ts";
import {usePlots} from "../composables/plots.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import {inject} from "vue";
import type {Point2D} from "../types.ts";

const rect_store = useRectStore();
const gen_id = inject('gen-id') as () => number;
const {commit} = useSnapshot();

const tool_store = useToolStore();

const layer_offset: Point2D = inject('layer-offset');

const {
  start,
  end,
  show_preview,
  plotting,
  start_plot,
  cancel_plot,
  move_end,
  rect_preview
} = usePlots(layer_offset);

const end_plot_rect = (e: PointerEvent) => {
  end.value = {x: e.offsetX - layer_offset.x, y: e.offsetY - layer_offset.y};
  tool_store.set('');
  const s_gte_x: boolean = start.value.x - end.value.x > 0;
  const s_gte_y: boolean = start.value.y - end.value.y > 0;

  const width = (start.value.x - end.value.x) * (s_gte_x ? 1 : -1);
  const height = (start.value.y - end.value.y) * (s_gte_y ? 1 : -1);
  const x = s_gte_x ? end.value.x : start.value.x;
  const y = s_gte_y ? end.value.y : start.value.y;

  commit(-1);

  const r = {x, y, width, height, id: gen_id()};
  rect_store.create(r);

  show_preview.value = false;
  plotting.value = false;
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
    transformed-event-catcher(
      @pointer-down="start_plot"
      @pointer-up="end_plot_rect"
      @pointer-leave="cancel_plot_handler"
      @pointer-move="move_end"
    )
      g(v-if="show_preview && plotting")
        rect.preview(:x="rect_preview.x" :y="rect_preview.y" :width="rect_preview.width" :height="rect_preview.height" fill="transparent" stroke="red" stroke-width="1")
        circle.preview(:cx="rect_preview.x + rect_preview.width / 2" :cy="rect_preview.y + rect_preview.height / 2" r="3" fill="black" stroke="white" stroke-width="1")

</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";

</style>