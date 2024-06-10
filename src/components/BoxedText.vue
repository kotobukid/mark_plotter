<script setup lang="ts">
import {ref, computed, onMounted, watch, watchEffect, nextTick} from 'vue';
import type {LabelText, Tool} from "../types.ts";

const props = defineProps<{
  label_text: LabelText,
  tool: Tool
}>();

const emits = defineEmits<{
  (e: 're-edit-text', value: LabelText): void
  (e: 'erase-element', value: number): void
}>();

const lineHeight = 28;
const textRef = ref(null);

const whole_text = computed(() => {
  return props.label_text.text;
});

const lines = computed(() => {
  return props.label_text.text.split('\\n');
});

const adjust_box = () => {
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
};

watch(whole_text, () => {
  nextTick(() => {
    adjust_box();
  });
});

onMounted(() => {
  adjust_box();
});

const box_width = ref(0);
const box_height = ref(lines.value.length * lineHeight);

const box_start_y = computed(() => {
  return props.label_text.y - lineHeight - 4;
});

const box_start_x = computed(() => {
  return props.label_text.x - 10;
});

const editable_style = computed(() => {
  if (['edit', 'erase'].includes(props.tool)) {
    return "pointer-events: auto;";
  } else {
    return "pointer-events: none;"
  }
});

const re_edit = () => {
  if (props.tool === 'edit') {
    emits('re-edit-text', props.label_text);
  } else if (props.tool === 'erase') {
    emits('erase-element', props.label_text.id)
  }
};

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
      :style="editable_style"
      @click="re_edit"
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
g.text_box {
  pointer-events: none;

  rect.box {
    cursor: text;
  }
}
</style>