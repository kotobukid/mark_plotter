<script setup lang="ts">
import {useTextStore} from "../stores/texts.ts";
import {ref, inject} from "vue";
import {useToolStore} from "../stores/tool.ts";
import {useSnapshot} from "../composables/snapshot.ts";
import type {Point2D} from "../types.ts";

const store = useTextStore();
const tool_store = useToolStore();
const gen_id = inject('gen-id') as () => number;
const {commit} = useSnapshot();

const vAutoFocus = {
  mounted(el: HTMLElement) {
    text.value = store.buffer + '';
    el.focus();
  }
};

const text = ref("");

const text_changed = (e: InputEvent) => {
  text.value = (e.target as HTMLInputElement).value;
};

const submit_text = () => {
  const _text: string = text.value.trim();

  if (_text) {
    tool_store.set('');

    commit(-1);

    const pos: Point2D = store.locate_to_create;

    if (store.edit_target > 0) {
      store.update_text(_text.replace(/\n/g, '\\n'));
    } else {
      store.create({
        ...pos,
        text: _text.replace(/\n/g, '\\n'),
        id: gen_id()
      });
    }

    store.hide_tool_option();
    text.value = '';
  }
};

const cancel_edit = () => {
  store.hide_tool_option();
  tool_store.set('');
};
</script>

<template lang="pug">
  .text_tool_option(v-if="store.show_option")
    .block
      textarea(v-auto-focus :value="text" @change="text_changed")
      button.submit(@click="submit_text") OK
      button.cancel(@click="cancel_edit") Cancel
</template>

<style scoped lang="less">
.block {
  display: flex;
  align-items: flex-start;
}

textarea {
  width: 380px;
  height: 2rem;
  padding: 2px;
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