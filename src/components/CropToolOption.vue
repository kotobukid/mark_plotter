<script setup lang="ts">

import {useCropStore} from "../stores/crop.ts";
import type {MyRect, Tool} from "../types.ts";

const crop_store = useCropStore();

const props = defineProps<{
  tool: Tool,
}>();

const emits = defineEmits<{
  (e: 'switch-tool', value: Tool): void,
  (e: 'commit-crop', value: MyRect): void,
}>();

const submit = () => {
  const crop_rect: MyRect = crop_store.commit();
  emits('commit-crop', crop_rect);
};

</script>

<template lang="pug">
  .option(v-if="tool==='crop'")
    button(@click="submit") 確定
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