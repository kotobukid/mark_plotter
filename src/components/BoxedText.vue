<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue';
import type {LabelText} from "../types.ts";

const props = defineProps<{
  label_text: LabelText,
}>();

const lineHeight = 28;
const textRef = ref(null);

const lines = computed(() => {
  return props.label_text.text.split('\\n');
});

watch(lines, () => {
  // const $g = textRef.value;
  // $g.querySelectorAll('text').forEach(($text) => {
  //   const bbox = $text.getBBox();
  // });
  //
  // textRef.value = lines.value.map((_, i) => ref(null));
});

onMounted(() => {
  const $g = textRef;

  if ($g.value) {
    const texts = $g.value.querySelectorAll('text');

    let b_width_max = 0;
    let b_height = 0;

    texts.forEach(($text: SVGGraphicsElement) => {
      const bbox = $text.getBBox();
      b_width_max = Math.max(b_width_max, bbox.width);
      b_height = b_height + bbox.height
    });
    box_width.value = b_width_max;
    box_height.value = b_height;
  }
});

const box_width = ref(0);
const box_height = ref(lines.value.length * lineHeight);

const box_start_y = computed(() => {
  return props.label_text.y - lineHeight - 4;
});

const box_start_x = computed(() => {
  return props.label_text.x - 10;
});

</script>

<template lang="pug">
  g.text_box
    rect.box(
      rx="3"
      ry="3"
      fill="white"
      stroke="red"
      stroke-width="1"
      :x="box_start_x"
      :y="box_start_y"
      :width="box_width + 20"
      :height="box_height + 10"
    )
    g(ref="textRef")
      text.main.line(
        v-for="(line, i) in lines"
        :key="i"
        :x="label_text.x"
        :y="label_text.y + lineHeight * i"
        style="fill: red; stroke: none; stroke-width: 0; white-space: pre; font-family: Arial, sans-serif; font-size: 28px;"
      ) {{ line }}
</template>

<style scoped>

</style>