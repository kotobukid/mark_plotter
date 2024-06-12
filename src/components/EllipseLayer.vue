<script setup lang="ts">
import {useEllipseStore} from "../stores/ellipses.ts";
import {useToolStore} from "../stores/tool.ts";
import {computed} from "vue";

const store = useEllipseStore();
const tool_store = useToolStore();

const ellipses = computed(() => store.ellipses);

const ellipse_clicked = (id: number) => {
  if (tool_store.current === 'erase') {
    store.erase(id);
  }
};
</script>

<template lang="pug">
  g.ellipses
    ellipse(v-for="e in ellipses" :key="e.id" :cx="e.cx" :cy="e.cy" :rx="e.rx" :ry="e.ry" fill="transparent" stroke="red" stroke-width="2" style="fill: transparent;"
      @click="ellipse_clicked(e.id)"
    )
</template>

<style scoped lang="less">

</style>