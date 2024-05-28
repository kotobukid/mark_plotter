<script setup lang="ts">
import type {LabelText} from "../types.ts";
import {onMounted, ref} from "vue";

const props = defineProps<{
  label_text: LabelText,
}>();

const text_width = ref(200);
const text_height = ref(28);

const textRef = ref(null);

onMounted(() => {
  const {width, height} = textRef.value.getBBox();
  text_width.value = width;
  text_height.value = height;
});

</script>

<template lang="pug">
  g.text
    rect.text(
      :x="label_text.x - 10"
      :y="label_text.y - 33"
      rx="3"
      ry="3"
      fill="white"
      stroke="red"
      stroke-width="1"
      :width="text_width + 20"
      :height="text_height + 10")
    text.label_text(ref="textRef" :x="label_text.x" :y="label_text.y" fill="red" stroke="none" stroke-width="0" style="white-space: pre; font-family: Arial, sans-serif; font-size: 28px;") {{ props.label_text.text }}
</template>

<style scoped lang="less">

</style>