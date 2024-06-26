<script setup lang="ts">
import TransformedEventEmitter from "./TransformedEventEmitter.vue";
import {inject} from "vue";
import {useToolStore} from "../stores/tool.ts";
import {useLineStore} from "../stores/lines.ts";
import {usePlots} from "../composables/plots.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import type {Point2D} from "../types.ts";

const store = useLineStore();
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
  move_end
} = usePlots(layer_offset);

const end_plot_line = (e: PointerEvent) => {
  end.value = {x: e.offsetX - layer_offset.x, y: e.offsetY - layer_offset.y};
  tool_store.set('');

  commit(-1);

  store.create({
    x1: start.value.x,
    y1: start.value.y,
    x2: end.value.x,
    y2: end.value.y,
    id: gen_id()
  });

  show_preview.value = false;
  plotting.value = false;
};

</script>

<template lang="pug">
  g.line_plot_layer(
    v-if="tool_store.current === 'line'"
  )
    transformed-event-emitter(
      @pointer-down="start_plot"
      @pointer-up="end_plot_line"
      @pointer-leave="cancel_plot"
      @pointer-move="move_end"
    )
      line.preview(v-if="show_preview && plotting" :x1="start.x" :y1="start.y" :x2="end.x" :y2="end.y" stroke="red" stroke-width="2" fill="none"  style="marker-start: url(\"#marker-1\");")
</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>