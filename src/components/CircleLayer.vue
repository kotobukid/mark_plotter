<script setup lang="ts">
import {useCircleStore} from "../stores/circles.ts";
import {useToolStore} from "../stores/tool.ts";
import {computed} from "vue";

const tool_store = useToolStore();
const store = useCircleStore();

const circles = computed(() => {
  return store.circles
});

const tool = computed(() => {
  return tool_store.current;
});

const circle_clicked = (id: number) => {
  if (tool.value === 'erase') {
    store.erase(id);
  }
  // if (tool_store.current === 'erase') {
  //   emits('erase-element', {id, cat: 'circle'});
  // }
};
</script>

<template lang="pug">
  g.circles
    circle(v-for="c in circles" :key="c.id" :cx="c.cx" :cy="c.cy" :r="c.r" fill="transparent" stroke="red" stroke-width="2" style="fill: transparent;"
      @click="circle_clicked(c.id)"
    )

</template>

<style scoped lang="less">

</style>