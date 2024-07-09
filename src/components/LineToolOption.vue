<script setup lang="ts">
import {useTextStore} from "../stores/texts.ts";
import {ref, inject} from "vue";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import type {ArrowDirection, Point2D} from "../types.ts";
import {useTool} from "../composables/tool.ts";

const {current_tool, set_arrow_direction} = useTool();

// const gen_id = inject('gen-id') as () => number;
// const {commit} = useSnapshot();

const tool_store = useToolStore();

const set_arrow_direction_handle = (e: Event) => {
  // @ts-ignore
  set_arrow_direction(e.target.value! as ArrowDirection);
};
</script>

<template lang="pug">
  .line_tool_option(v-if="current_tool === 'line'")
    .block
      span {{ current_tool.current }}
      select(:value="tool_store.arrow_direction" @change="set_arrow_direction_handle")
        option(value="forward") ←
        option(value="both") ↔
        option(value="none") -
</template>

<style scoped lang="less">
.block {
  display: flex;
  align-items: flex-start;
}

button.submit {
  width: 40px;
  height: 37px;
  padding: 2px;
  margin: 1px;
}

button.cancel {
  width: 80px;
  height: 37px;
  padding: 2px;
  margin: 1px;
}
</style>