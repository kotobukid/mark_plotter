<script setup lang="ts">
import type {OffsetXY, MovementXY} from "../types.ts";
import {useTransformStore} from "../stores/transform.ts";

const {
  transformed_offset,
  transformed_offset_movement,
  zoom_in
} = useTransformStore();

const emits = defineEmits<{
  (e: 'pointer-down', value: OffsetXY): void,
  (e: 'pointer-up', value: OffsetXY): void,
  (e: 'pointer-move', value: MovementXY & OffsetXY): void,
  (e: 'pointer-leave', value: OffsetXY): void,
}>();

const start_plot = (e: PointerEvent) => {
  emits('pointer-down', transformed_offset({
    offsetX: e.offsetX,
    offsetY: e.offsetY
  }));
};

const complete_plot = (e: PointerEvent) => {
  emits('pointer-up', transformed_offset({
    offsetX: e.offsetX,
    offsetY: e.offsetY
  }));
};

const cancel_plot = (e: PointerEvent) => {
  emits('pointer-leave', {
    offsetX: e.offsetX,
    offsetY: e.offsetY,
  });
};

const move_end = (e: PointerEvent) => {
  emits('pointer-move', transformed_offset_movement({
    offsetX: e.offsetX,
    offsetY: e.offsetY,
    movementX: e.movementX,
    movementY: e.movementY
  }));
};

const wheeled = (e: WheelEvent) => {
  zoom_in(e);
};
</script>

<template lang="pug">
  g.transformed_event_emitter
    rect.event_emitter(
      x="-4000" y="-4000" width="8000" height="8000"
      @pointerdown="start_plot"
      @pointerup="complete_plot"
      @pointerleave="cancel_plot"
      @pointermove="move_end"

      @wheel.prevent="wheeled"
    )
    slot
</template>

<style scoped lang="less">
rect.event_emitter {
  fill: pink;
  opacity: 0.1;
  stroke: white;
  stroke-width: 1px;
}
</style>