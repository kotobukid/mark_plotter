<script setup lang="ts">
import {computed, provide} from "vue";
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";
import FileList from "./components/FileList.vue";
import CropToolOption from "./components/CropToolOption.vue";
import {useClipBoard} from "./composables/clipboard.ts";
import {useToolStore} from "./stores/tool.ts";
import {useImageStore} from "./stores/images.ts";
import {useSnapshot} from "./composables/snapshot.ts";
import {useImage} from "./composables/image.ts";
import {useFileSystem} from "./composables/fileSystem.ts";

const image_store = useImageStore();

const tool_store = useToolStore();
const {commit, undo_available, pop_last, wipe} = useSnapshot();


const _gen_id = (() => {
  let id: number = 0;
  return () => {
    id = id + 1;
    // console.log(id);
    return id;
  };
});

const gen_id = _gen_id();

provide('gen-id', gen_id);

const {
  capture_clipboard,
} = useClipBoard(gen_id);

const {
  save_as,
  open_file_dialog,
  overwrite_file,
  target_file,
  target_files,
  writable_handle,
  overwrite_available,
  open_file_from_list,
  filename,
  original_filename
} = useFileSystem(gen_id);

import type {
  ImageAndDimensions,
  MyCircle,
  MyRect,
  MyLine,
  MyEllipse,
  Snapshot,
  LabelText, Tool,
} from "./types.ts";

const {
  push_image
} = useImage();


const open_svg_handle = () => {
  open_file_dialog();
  wipe();
};

const overwrite_handle = () => {
  overwrite_file();
};

const close_file = async () => {
  target_file.value = null;
  filename.value = '';
};

const switch_tool = (_tool: Tool) => {
  tool_store.set(_tool);
};

const container_style = computed(() => {
  return image_store.container_style(220 + 20);
});


const clear_files = (): void => {
  target_files.value = [];
};

const apply_last_snapshot = () => {
  pop_last();
};

const wipe_handle = () => {
  const do_wipe = confirm("画像以外の全要素を削除しますか？");
  if (do_wipe) {
    wipe();
  }
};

const capture_clipboard_handle = async () => {
  capture_clipboard().then((_filename: string) => {
    document.title = _filename;
    target_file.value = null;
  }).catch(() => {
    alert('PrintScreenができていません');
  });
};

const save_as_handler = () => {
  save_as(filename.value);
};

</script>

<template lang="pug">
  .tool_options#tool_option
    crop-tool-option
  .container(:style="container_style")
    ToolRibbon(style="margin-right: 16px; width: 200px; height: 600px; float: left;")
      a.button(href="#" @click.prevent="open_svg_handle" draggable="false")
        img.tool_icon(src="/open.svg" draggable="false")
        span 画像を開く
      a.button(href="#" @click.prevent="capture_clipboard_handle" draggable="false")
        img.tool_icon(src="/paste.svg" draggable="false")
        span 新規貼り付け
      a.button(href="#" @click.prevent="wipe_handle" draggable="false")
        img.tool_icon(src="/wipe_all.svg" draggable="false")
        span 全消去
      a.button.sub(href="#" @click.prevent="switch_tool('erase')" :data-active="tool_store.current === 'erase'" draggable="false")
        img.tool_icon(src="/erase.svg" draggable="false")
        span 選択削除
      a.button(href="#" @click.prevent="apply_last_snapshot" draggable="false" :class="undo_available ? '' : 'disabled'")
        img.tool_icon(src="/undo.svg" draggable="false")
        span 元に戻す
      a.button(href="#" @click.prevent="switch_tool('crop')" :data-active="tool_store.current === 'crop'" draggable="false")
        img.tool_icon(src="/crop.svg" draggable="false")
        span 切り抜きツール
      a.button(href="#" @click.prevent="switch_tool('rect')" :data-active="tool_store.current === 'rect'" draggable="false")
        img.tool_icon(src="/rect.svg" draggable="false")
        span 矩形ツール
      a.button(href="#" @click.prevent="switch_tool('circle')" :data-active="tool_store.current === 'circle'" draggable="false")
        img.tool_icon(src="/circle.svg" draggable="false")
        span 円ツール
      a.button(href="#" @click.prevent="switch_tool('ellipse')" :data-active="tool_store.current === 'ellipse'" draggable="false")
        img.tool_icon(src="/ellipse.svg" draggable="false")
        span 楕円ツール
      a.button(href="#" @click.prevent="switch_tool('line')" :data-active="tool_store.current === 'line'" draggable="false")
        img.tool_icon(src="/line.svg" draggable="false")
        span 矢印ツール
      a.button(href="#" @click.prevent="switch_tool('text')" :data-active="tool_store.current === 'text'" draggable="false")
        img.tool_icon(src="/text.svg" draggable="false")
        span テキストツール
      a.button.sub(href="#" @click.prevent="switch_tool('edit')" :data-active="tool_store.current === 'edit'" draggable="false")
        img.tool_icon(src="/edit.svg" draggable="false")
        span 再編集ツール
      a.button(href="#" @click.prevent="save_as_handler" draggable="false")
        img.tool_icon(src="/save.svg" draggable="false")
        span SVGを新規保存
      a.button.sub(href="#" @click.prevent="overwrite_file_handle" draggable="false" :class="overwrite_available ? '' : 'disabled'")
        img.tool_icon(src="/save_overwrite.svg" draggable="false")
        span 上書き保存
    SvgPreview(
      style="float: left;"
    )
  file-list(
    v-if="target_files.length > 0"
    :files="target_files"
    :opened_file="original_filename"
    @open-file="open_file_from_list"
    @clear-files="clear_files"
  )
  br.clearfix
</template>

<style scoped lang="less">
a.button {
  display: block;
  width: 190px;

  background-image: none;

  &.disabled {
    background-color: grey;
    background-image: none;
    color: black;
    cursor: not-allowed;

    &:active {
      position: relative;
      top: 0;
    }

    &:hover, &:active {
      background-color: grey;
      background-image: none;
    }
  }

  &:active {
    color: blue;
    position: relative;
    top: 1px;
  }

  &:hover {
    background-image: url('/button_hover.png');
    background-color: lightblue;
  }

  span {
    position: relative;
    top: -8px;
    margin-left: 10px;
    margin-right: 10px;
  }

  text-decoration: none;
  user-select: none;
  margin: 0 10px 5px 0;

  &[data-active="true"] {
    background-image: url('/button_active.png');
  }

  //display: inline-block;
  background-color: white;
  border: 1px solid black;
  border-radius: 3px;
  padding: 3px;

  &.sub {
    margin-left: 10px;
    width: 180px;
  }
}

img.tool_icon {
  width: 2rem;
  height: 2rem;
}

.container {
  float: left;
  padding: 8px 8px 8px 0;
  height: 100%;

  padding-top: @tool_option_height + 18px;

  background-color: white;
}

.clearfix {
  clear: both;
}


@tool_option_height: 40px;
.tool_options {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: darkgrey;
  border: 1px solid black;
  border-radius: 3px;
  padding: 3px;
  width: 98%;
  height: @tool_option_height;
  margin: 0;
}
</style>
