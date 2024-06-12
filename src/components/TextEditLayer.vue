<script setup lang="ts">
import {useToolStore} from "../stores/tool.ts";
import {useTextStore} from "../stores/texts.ts";
import {useHistoryManager} from "../composables/history_management.ts";
import {usePlots} from "../composables/plots.ts";
import type {Point2D} from "../types.ts";
import {inject} from "vue";

const store = useTextStore();
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

const end_plot_text = (e: PointerEvent) => {
  show_preview.value = false;

  // show_cursor.value = false;

  setTimeout(() => {
    const text: string = (prompt('\\nで改行', '') || '').trim();
    if (text) {
      tool_store.set('');
      store.create({
        text,
        x: e.offsetX - layer_offset.x,
        y: e.offsetY - layer_offset.y,
        id: gen_id()
      });
    }
    plotting.value = false;
  }, 100);
};

const shift_text_preview = (e: PointerEvent) => {
  start.value = {
    x: e.offsetX - layer_offset.x,
    y: e.offsetY - layer_offset.y
  };
};

</script>

<template lang="pug">
  g.text_plot_layer(
    v-if="tool_store.current === 'text'"
  )
    rect(fill="orange" opacity="0.1" x="0" y="0" width="1920" height="1080"
      @pointerdown="start_plot"
      @pointerup="end_plot_text"
      @pointerleave="cancel_plot"
      @pointermove="shift_text_preview"
    )
    rect.preview(:x="start.x - 10" :y="start.y - 33" width="120" height="42" stroke="red" stroke-width="1" fill="white" opacity="0.5")

</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>