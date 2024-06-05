<script setup lang="ts">
import {ref} from "vue";

const props = defineProps<{
  files: File[],
  opened_file: string
}>();
const emits = defineEmits<{
  (e: 'open-file', value: File): void
  (e: 'clear-files'): void
}>();

const handle_file = (f: File): void => {
  emits('open-file', f);
};

const minimized = ref(false);
</script>

<template lang="pug">
  .wrapper(:data-minimized="minimized ? 'min' : ''")
    .actions
      button(@click="emits('clear-files')") clear list
      button.min(@click="minimized = !minimized") -
    .table_wrapper
      table.file_list
        colgroup
          col(style="width: 200px;")
          col(style="width: 120px;")
        tbody
          tr(
            v-for="f in files"
            :key="f.name"
            @click="handle_file(f)"
            :data-opened="opened_file === f.name"
            :title="f.name"
          )
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

    .table_wrapper {
      display: none;
    }
  }
}

.actions {
  margin-bottom: 5px;

  button {
    cursor: pointer;
    margin-right: 5px;
    border: 1px solid grey;
    border-radius: 3px;

    &:active {
      position: relative;
      top: 1px;
    }

    &:hover {
      background-color: lightgreen;
    }

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

  &[data-opened="true"] td {
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

.table_wrapper {
  max-height: 800px;
  width: 336px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>