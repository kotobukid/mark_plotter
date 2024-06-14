<script setup lang="ts">
import {useTool} from "../composables/tool.ts";

const {current_tool, circle_option, set_circle_tool} = useTool();
</script>

<template lang="pug">
  div(v-if="current_tool === 'circle'")
    img.tool_option(src="/draw_circle_full.svg" @click="set_circle_tool('draw_full')" :data-active="circle_option === 'draw_full'"
      title="矩形から作成"
    )
    img.tool_option(src="/draw_circle_half.svg" @click="set_circle_tool('draw_half')" :data-active="circle_option === 'draw_half'"
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