<script setup lang="ts">
import {useTool} from "../composables/tool.ts";
import {useTransformStore} from "../stores/transform.ts";

const transform_store = useTransformStore();
const {current_tool} = useTool();

const reset = () => {
  transform_store.reset_transform();
};
</script>

<template lang="pug">
  .viewport_option(v-if="['pan', ''].includes(current_tool)")
    .block
      button.submit(@click="reset") Reset Viewport
</template>

<style scoped lang="less">
.block {
  display: flex;
  align-items: flex-start;
}

button {
  font-size: 1.8rem;
}
</style>