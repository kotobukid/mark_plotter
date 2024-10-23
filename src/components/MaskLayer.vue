<script setup lang="ts">
import {useMaskStore} from "../stores/masks.ts";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import {computed} from "vue";

const store = useMaskStore();
const tool_store = useToolStore();
const {commit} = useSnapshot();

const masks = computed(() => store.masks);

const mask_clicked = (id: number) => {
  if (tool_store.current === 'erase') {
    commit(-1);
    store.erase(id);
  }
};
</script>

<template lang="pug">
  g.masks
    rect(v-for="r in masks" :key="r.id" :x="r.x" :y="r.y" :width="r.width" :height="r.height" fill="black" stroke="black" stroke-width="2"
      @click="mask_clicked(r.id)"
    )
</template>

<style scoped lang="less">

</style>