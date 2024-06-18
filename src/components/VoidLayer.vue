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
      x="-40000"
      y="-40000"
      width="80000"
      height="80000"
      @wheel="wheeled"
    )
</template>

<style scoped lang="less">
.void {
  fill: transparent;
  stroke: transparent;
  stroke-width: 0;
  opacity: 0;
}
</style>