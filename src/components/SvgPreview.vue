<script setup lang="ts">
import {computed, ref} from "vue";

type Tool = "" | "circle"
const props = defineProps<{
    tool: Tool,
    image: {
        dataUrl: string,
        width: number,
        height: number
    }
}>();

const clicked = (e: MouseEvent) => {
    if (props.tool === "circle") {
        circles.value.push({
            cx: e.offsetX,
            cy: e.offsetY,
            r: 16
        });
    }
};

type Circle = {
    cx: number,
    cy: number,
    r: number
}

const viewBox = computed(() => {
    if (props.image.dataUrl) {
        return `0 0 ${props.image.width} ${props.image.height}`
    } else {
        return '0 0 480 360';
    }
})

const circles = ref<Circle[]>([])
</script>

<template lang="pug">
    svg(:viewBox="viewBox" @click="clicked" :width="props.image.width" :height="props.image.height")
        image(:href="props.image.dataUrl" :width="props.image.width" :height="props.image.height")
        g.circles
            circle(v-for="c in circles" :cx="c.cx" :cy="c.cy" :r="c.r" fill="transparent" stroke="red" stroke-width="1")
</template>

<style scoped>
svg {
    outline: 1px solid grey;
}
</style>