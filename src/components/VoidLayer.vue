<script setup lang="ts">
import {useTransformStore} from "../stores/transform.ts";
import {useTool} from "../composables/tool.ts";

const {zoom_in} = useTransformStore();
const {current_tool} = useTool();

const wheeled = (e: WheelEvent) => {
  zoom_in(e);
};
</script>

<template lang="pug">
  g.void_layer(v-if="current_tool === ''")
    rect.void(
      x="-4000"
      y="-4000"
      width="8000"
      height="8000"
      fill="transparent"
      stroke-width="0"
      stroke="transparent"
      @wheel.prevent="wheeled"
    )
</template>

<style scoped lang="less">
.void {
  opacity: 0;
}
</style>