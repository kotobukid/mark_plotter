<script setup lang="ts">
import {useTransformStore} from "../stores/transform.ts";
import {useTool} from "../composables/tool.ts";

const {zoom_in} = useTransformStore();
const {current_tool} = useTool();

const wheeled = (e: WheelEvent) => {
  console.log(e);
  zoom_in(e);
};
</script>

<template lang="pug">
  g.void_layer(v-if="current_tool === ''")
    rect.void(
      x="-10"
      y="-10"
      width="4000"
      height="4000"
      @wheel="wheeled"
    )
</template>

<style scoped lang="less">
.void {
  fill: blue;
  stroke: black;
  stroke-width: 1px;
  opacity: 0.1;
}
</style>