<script setup lang="ts">

import {useCropStore} from "../stores/crop.ts";
import {useToolStore} from "../stores/tool.ts";
import type {MyRect, Tool} from "../types.ts";

const crop_store = useCropStore();
const tool_store = useToolStore();


const emits = defineEmits<{
  (e: 'switch-tool', value: Tool): void,
  (e: 'commit-crop', value: MyRect): void,
}>();

const submit = () => {
  const crop_rect: MyRect = crop_store.commit();
  emits('commit-crop', crop_rect);
};

const reset = () => {
  crop_store.reset();
  tool_store.set('');
};

</script>

<template lang="pug">
  .option(v-if="tool_store.current === 'crop'")
    button(@click="reset") 解除
    button(@click="submit") 切り抜き確定
</template>

<style scoped lang="less">
button {
  cursor: pointer;
  font-size: 30px;
  margin-right: 5px;

  &:active {
    position: relative;
    top: 1px;
  }

  &:last-child {
    margin-right: 0;
  }
}
</style>