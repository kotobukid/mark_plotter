<script setup lang="ts">
import {useLineStore} from "../stores/lines.ts";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import {computed} from "vue";

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
</script>

<template lang="pug">
  g.lines
    line.line_arrow(v-for="l in lines" :key="l.id" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" fill="transparent" stroke="red" stroke-width="2" style="marker-start: url(\"#marker-1\");"
      @click="line_clicked(l.id)"
    )

</template>

<style scoped lang="less">

</style>