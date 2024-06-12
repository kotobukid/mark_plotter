<script setup lang="ts">
import {useTextStore} from "../stores/texts.ts";
import {useToolStore} from "../stores/tool.ts";
import BoxedText from "./BoxedText.vue";
import {computed, inject} from "vue";
import type {EraseTarget, LabelText} from "../types.ts";

const store = useTextStore();
const tool_store = useToolStore();
const gen_id = inject('gen-id') as () => number;


const texts = computed(() => store.texts);

const re_edit_text = (label_text: LabelText) => {
  const text: string = (prompt('\\nで改行', label_text.text) || '').trim();
  if (text) {
    const lt: LabelText = {
      ...label_text,
      text,
    };
    // emits('add-text', lt);
    add_text(lt);
  }
};

const add_text = (t: LabelText) => {
  // commit_snapshot(take_snapshot(-1));
  if (t.id !== -1) {
    // edit
    const _texts = texts.value.concat([]);
    for (let i = 0; i < _texts.length; i++) {
      if (_texts[i].id === t.id) {
        _texts[i].text = t.text;
        break;
      }
    }
    store.replace(_texts);
  } else {
    // new
    t.text = t
      .text.replace(/\</, '＜')
      .replace(/\>/, '＞')
    t.id = gen_id();
    store.create(t);
  }
};


const erase_text = (erase_target: EraseTarget) => {
  store.erase(erase_target.id);
};
</script>

<template lang="pug">
  g.texts
    BoxedText(
      v-for="t in texts"
      :key="t.id"
      :label_text="t"
      :tool="tool_store.current"
      @re-edit-text="re_edit_text"
      @erase-element="erase_text"
    )
</template>

<style scoped lang="less">

</style>