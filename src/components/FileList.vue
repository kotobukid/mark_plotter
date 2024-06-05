<script setup lang="ts">
import {ref} from "vue";

const props = defineProps<{ files: File[] }>();
const emits = defineEmits<{
  (e: 'open-file', value: File): void
  (e: 'clear-files'): void
}>();

const last_opened = ref('');

const handle_file = (f: File): void => {
  last_opened.value = f.name;
  emits('open-file', f);
};

const minimized = ref(false);
</script>

<template lang="pug">
  .wrapper(:data-minimized="minimized ? 'min' : ''")
    .actions
      button(@click="emits('clear-files')") clear list
      button.min(@click="minimized = !minimized") -
    table.file_list
      colgroup
        col(style="width: 200px;")
        col(style="width: 120px;")
      tbody
        tr(v-for="f in files" :key="f.name" @click="handle_file(f)" :data-last-opened="last_opened === f.name")
          td(v-text="f.name")
          td(v-text="f.type")

</template>

<style scoped lang="less">
.wrapper {
  padding: 4px;
  border: 1px solid grey;
  border-radius: 4px;
  background-color: white;
  width: 320px;
  position: absolute;
  right: 20px;

  &[data-minimized="min"] {
    width: 21px;
    height: 21px;

    .actions {
      button {
        display: none;
      }

      .min {
        display: inline-block;
      }
    }

    table.file_list {
      display: none;
    }
  }
}

.actions {
  margin-bottom: 5px;
  button {
    margin-right: 5px;
    &:last-child {
      margin-right: 0;
    }
  }
}

table.file_list {
  width: 320px;
  border-collapse: collapse;
  table-layout: fixed;
}

tr {
  &:hover {
    cursor: pointer;

    td {
      background-color: lightblue;
    }
  }

  &[data-last-opened="true"] td {
    background-color: pink;
  }
}


td {
  border: 1px solid grey;
  padding: 1px;
  overflow-x: hidden;
  background-color: white;
  color: black;
}

</style>