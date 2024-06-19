<script setup lang="ts">
import {useCircleStore} from "../stores/circles.ts";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import {computed} from "vue";

const store = useCircleStore();
const tool_store = useToolStore();
const {commit} = useSnapshot();

const circles = computed(() => {
  return store.circles
});

const tool = computed(() => {
  return tool_store.current;
});

const circle_clicked = (id: number) => {
  if (tool.value === 'erase') {
    commit(-1);
    store.erase(id);
  }
};
</script>

<template lang="pug">
  g.circles
    circle(v-for="c in circles" :key="c.id" :cx="c.cx" :cy="c.cy" :r="c.r" fill="transparent" stroke="red" stroke-width="2"
      @click="circle_clicked(c.id)"
    )

</template>

<style scoped lang="less">

</style>