<script setup lang="ts">
import {useToolStore} from "../stores/tool.ts";
import {computed} from "vue";

const tool_store = useToolStore();

const current_option = computed(() => tool_store.circle_tool_option);
const set_option = (option: 'draw_full' | 'draw_half') => {
  tool_store.set_circle_tool(option)
};

</script>

<template lang="pug">
  div(v-if="tool_store.current === 'circle'")
    img.tool_option(src="/draw_circle_full.svg" @click="set_option('draw_full')" :data-active="tool_store.circle_tool_option === 'draw_full'"
      title="矩形から作成"
    )
    img.tool_option(src="/draw_circle_half.svg" @click="set_option('draw_half')" :data-active="tool_store.circle_tool_option === 'draw_half'"
      title="中心から作成"
    )
</template>

<style scoped lang="less">
.tool_options {
  img.tool_option {

    margin-right: 5px;

    &:last-child {
      margin-right: 0;
    }
  ;

    cursor: pointer;
    width: 40px;
    height: 40px;

    &[data-active="true"] {
      outline: 2px solid blue;
      background-color: lightblue;
    }
  }
}
</style>