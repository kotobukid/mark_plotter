<script setup lang="ts">
import TransformedEventEmitter from "./TransformedEventEmitter.vue";
import {useToolStore} from "../stores/tool.ts";
import {useTextStore} from "../stores/texts.ts";
import {usePlots} from "../composables/plots.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import type {Point2D} from "../types.ts";
import {inject, ref} from "vue";

const store = useTextStore();
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

const end_plot_text = (e: PointerEvent) => {
  show_preview.value = false;
  plotting.value = false;

  store.set_edit_target(-1);
  store.set_buffer('');
  store.show_tool_option();

  store.set_locate_to_create({
    x: e.offsetX - layer_offset.x,
    y: e.offsetY - layer_offset.y,
  });
};

const shift_text_preview = (e: PointerEvent) => {
  if (plotting.value) {
    start.value = {
      x: e.offsetX - layer_offset.x,
      y: e.offsetY - layer_offset.y
    };
  }
};

</script>

<template lang="pug">
  g.text_plot_layer(
    v-if="tool_store.current === 'text'"
  )
    transformed-event-emitter(
      @pointer-down="start_plot"
      @pointer-up="end_plot_text"
      @pointer-leave="cancel_plot"
      @pointer-move="shift_text_preview"
    )
      rect.preview(:x="start.x - 10" :y="start.y - 33" width="120" height="42" stroke="red" stroke-width="1" fill="white" opacity="0.5")
</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>