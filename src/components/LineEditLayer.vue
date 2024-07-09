<script setup lang="ts">
import TransformedEventEmitter from "./TransformedEventEmitter.vue";
import {computed, inject} from "vue";
import {useToolStore} from "../stores/tool.ts";
import {useLineStore} from "../stores/lines.ts";
import {usePlots} from "../composables/plots.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import type {Point2D} from "../types.ts";

const store = useLineStore();
const gen_id = inject('gen-id') as () => number;
const {commit} = useSnapshot();
const tool_store = useToolStore();

const layer_offset: Point2D = inject('layer-offset');

const {
  start,
  end,
  show_preview,
  plotting,
  start_plot,
  cancel_plot,
  move_end
} = usePlots(layer_offset);

const end_plot_line = (e: PointerEvent) => {
  const restrict: boolean = tool_store.restrict_direction;

  if (!restrict) {
    end.value = {x: e.offsetX, y: e.offsetY};
  } else {
    end.value = get_directed(start.value, {
      x: e.offsetX - layer_offset.x,
      y: e.offsetY - layer_offset.y,
    });
  }

  tool_store.set('');

  const arrow_direction = tool_store.arrow_direction;

  commit(-1);

  store.create({
    x1: start.value.x,
    y1: start.value.y,
    x2: end.value.x,
    y2: end.value.y,
    arrow: arrow_direction,
    id: gen_id()
  });

  show_preview.value = false;
  plotting.value = false;
};

const arrow_direction = computed(() => {
  if (tool_store.arrow_direction === 'forward') {
    return 'marker-start: url(\"#marker-1\");'
  } else if (tool_store.arrow_direction === 'both') {
    return 'marker-start: url(\"#marker-1\"); marker-end: url(\"#marker-2\");'
  } else {
    return '';
  }
});

const get_directed = (start: Point2D, end: Point2D): Point2D => {
  let angle = Math.atan2(end.y - start.y, end.x - start.x);
  angle = (angle + (2 * Math.PI)) % (2 * Math.PI);

  if (angle >= (7 * Math.PI / 4) || angle < Math.PI / 4) {
    // right
    return {
      x: end.x, y: start.y
    };
  } else if (angle >= Math.PI / 4 && angle < (3 * Math.PI / 4)) {
    // up
    return {
      x: start.x, y: end.y
    };
  } else if (angle >= (3 * Math.PI / 4) && angle < (5 * Math.PI / 4)) {
    // left
    return {
      x: end.x, y: start.y
    };
  } else {
    // down
    return {
      x: start.x, y: start.y
    };
  }
};

const move_end_custom = (e: PointerEvent) => {
  if (plotting.value) {
    const restrict: boolean = tool_store.restrict_direction;
    if (!restrict) {
      move_end(e);
    } else {
      const _end = get_directed(start.value, {
        x: e.offsetX - layer_offset.x,
        y: e.offsetY - layer_offset.y,
      });

      // @ts-ignore
      move_end({
        offsetX: _end.x + layer_offset.x,
        offsetY: _end.y + layer_offset.y,
      });
    }
  }
};

</script>

<template lang="pug">
  g.line_plot_layer(
    v-if="tool_store.current === 'line'"
  )
    transformed-event-emitter(
      @pointer-down="start_plot"
      @pointer-up="end_plot_line"
      @pointer-leave="cancel_plot"
      @pointer-move="move_end_custom"
    )
      line.preview(v-if="show_preview && plotting" :x1="start.x" :y1="start.y" :x2="end.x" :y2="end.y" stroke="red" stroke-width="2" fill="none"  :style="arrow_direction")
</template>

<style scoped lang="less">
@import "../assets/edit_layer.css";
</style>