<script setup lang="ts">
import {useRectStore} from "../stores/rects.ts";
import {useToolStore} from "../stores/tool.ts";
import {computed} from "vue";

const store = useRectStore();
const tool_store = useToolStore();

const rects = computed(() => store.rects);

const rect_clicked = (id: number) => {
  if (tool_store.current === 'erase') {
    store.erase(id);
  }
};
</script>

<template lang="pug">
  g.rects
    rect(v-for="r in rects" :key="r.id" :x="r.x" :y="r.y" :width="r.width" :height="r.height" fill="transparent" stroke="red" stroke-width="2" style="fill: transparent;"
      @click="rect_clicked(r.id)"
    )
</template>

<style scoped lang="less">

</style>