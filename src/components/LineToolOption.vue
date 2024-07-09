<script setup lang="ts">
import {useTextStore} from "../stores/texts.ts";
import {ref, inject} from "vue";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import type {ArrowDirection, Point2D} from "../types.ts";
import {useTool} from "../composables/tool.ts";
import ImageSelect from "./ImageSelect.vue";

const {current_tool, set_arrow_direction, set_restrict_direction} = useTool();

const tool_store = useToolStore();

const set_arrow_direction_handle = (e: {target: {value: string}}) => {
  // @ts-ignore
  set_arrow_direction(e.target.value! as ArrowDirection);
};

const set_restrict_direction_handle = (e: Event) => {
  // @ts-ignore
  set_restrict_direction(e.target.value)
};

const items = [
  ['forward', '/mark_plotter/arrow_forward.svg'],
  ['both', '/mark_plotter/arrow_both.svg'],
  ['none', '/mark_plotter/arrow_none.svg'],
];

</script>

<template lang="pug">
  .line_tool_option(v-if="current_tool === 'line'")
    .block
      label
        span 軸方向制限:&nbsp;
        select(:value="tool_store.restrict_direction ? 'yes' : 'no'" @change="set_restrict_direction_handle")
          option(value="no") 制限なし
          option(value="yes") 制限あり
      label
        image-select(
          :items="items" :value="tool_store.arrow_direction"
          @change="set_arrow_direction_handle"
          )

</template>

<style scoped lang="less">
.block {
  display: flex;
  align-items: flex-start;
}

label {
  font-size: 2rem;
  margin-right: 15px;

  select {
    font-size: 2rem;
  }

  &:last-child {
    margin-right: 0;
  }
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