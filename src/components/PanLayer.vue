<script setup lang="ts">
import {useTool} from "../composables/tool.ts";
import {useTransformStore} from "../stores/transform.ts";
import {ref} from "vue";

const {move_transform} = useTransformStore();
const {current_tool} = useTool();

const panning = ref(false);

const start_pan = () => {
  panning.value = true;
};

const complete_pan = () => {
  panning.value = false;
};

const move_pan = (e: PointerEvent) => {
  if (panning.value) {
    move_transform(e);
  }
}
</script>

<template lang="pug">
  g.pan_layer(v-if="current_tool === 'pan'")
    rect.pan(
      x="-10"
      y="-10"
      width="4000"
      height="4000"
      @pointerdown="start_pan"
      @pointerup="complete_pan"
      @pointerleave="complete_pan"
      @pointermove="move_pan"
    )
</template>

<style scoped lang="less">
.pan {
  cursor: move;
  opacity: 0;
  fill: white;
  stroke: transparent;
  stroke-width: 0;
}
</style>