<script setup lang="ts">
import {useTool} from "../composables/tool.ts";
import {useTransformStore} from "../stores/transform.ts";
import {type Ref, ref, inject} from "vue";

const emits = defineEmits<{
  (e: 'wheeled', value: WheelEvent): void
}>();

const {move_transform} = useTransformStore();
const {current_tool} = useTool();

const panning = inject('panning') as Ref<boolean>;

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
};

const w = (e: WheelEvent) => {
  emits('wheeled', e);
};
</script>

<template lang="pug">
  g.gpan(@wheel.prevent="w")
    g.pan_layer(v-if="current_tool === 'pan'")
      rect.pan(
        x="-4000"
        y="-4000"
        width="8000"
        height="8000"
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