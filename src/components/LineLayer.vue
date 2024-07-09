<script setup lang="ts">
import {useLineStore} from "../stores/lines.ts";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import {computed} from "vue";
import type {ArrowDirection} from "../types.ts";

const store = useLineStore();
const tool_store = useToolStore();
const {commit} = useSnapshot();

const lines = computed(() => store.lines);

const line_clicked = (id: number) => {
  if (tool_store.current === 'erase') {
    commit(-1);
    store.erase(id);
  }
};

const arrow_direction = (direction: ArrowDirection) => {
  if (direction === 'forward') {
    return 'marker-start: url(\"#marker-1\");'
  } else if (direction === 'both') {
    return 'marker-start: url(\"#marker-1\"); marker-end: url(\"#marker-2\");'
  } else {
    return '';
  }
};
</script>

<template lang="pug">
  g.lines
    line.line_arrow(
      v-for="l in lines"
      :key="l.id"
      :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
      fill="transparent" stroke="red" stroke-width="2"
      :style="arrow_direction(l.arrow)"
      @click="line_clicked(l.id)"
    )

</template>

<style scoped lang="less">

</style>