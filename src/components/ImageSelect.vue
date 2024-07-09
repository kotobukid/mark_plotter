<script setup lang="ts">

import {computed, ref} from "vue";

const props = defineProps<{
  items: [string, string][],
  value: string
}>();

const emits = defineEmits<{
  (e: 'change', value: { target: { value: string } }): void,
}>();

const opened = ref(false);

const changed = (item: string) => {
  // @ts-ignore
  emits('change', {target: {value: item}});
  opened.value = false;
};

const current = computed(() => {
  return (props.items.find(item => item[0] === props.value) || ['', '']);
});
</script>

<template lang="pug">
  .image_select
    .open(v-if="opened")
      .back_screen(@click="opened = false")
      .items
        .item(v-for="item in props.items" :class="current[0] === item[0] ? 'active' : ''")
          img(:src="item[1]" @click.stop="changed(item[0])")
    .closed(v-else @click="opened = true;")
      img(:src="current[1]")
</template>

<style scoped lang="less">
.image_select {
  cursor: pointer;
  width: 200px;
  height: 40px;
  display: inline-block;
}

.back_screen {
  position: fixed;
  top: 0;
  left: 0;
  background-color: black;
  opacity: 0.5;
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  z-index: 10;
}

.items {
  z-index: 20;
  position: absolute;
}

.item {
  background-color: white;
  width: 200px;
  height: 40px;

  &.active {
    background-color: lightgreen;
  }

  &:hover {
    border-color: green;
    background-color: lightblue;
  }

  img {
    width: 200px;
    height: 40px;
  }
}

.closed {
  img {
    outline: 1px solid grey;
    background-color: white;
  }
}

</style>