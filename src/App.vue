<script setup lang="ts">
import {computed, nextTick, provide, ref} from "vue";
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";
import FileList from "./components/FileList.vue";
import CropToolOption from "./components/CropToolOption.vue";
import ViewPortOption from "./components/ViewPortOption.vue";
import {useClipBoard} from "./composables/clipboard.ts";
import {useToolStore} from "./stores/tool.ts";
import {useTransformStore} from "./stores/transform.ts";
import {useImageStore} from "./stores/images.ts";
import {useSnapshot} from "./composables/snapshot.ts";
import {useFileSystem} from "./composables/fileSystem.ts";
import {useSVG} from "./composables/svg.ts";

const image_store = useImageStore();
const transformStore = useTransformStore();

transformStore.init_zoom_level([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2], 9);

const tool_store = useToolStore();
const {commit, undo_available, pop_last, wipe, wipe_available} = useSnapshot();
const {rasterize} = useSVG();

const _gen_id = (() => {
  let id: number = 0;
  return () => {
    id = id + 1;
    return id;
  };
});

const gen_id = _gen_id();

provide('gen-id', gen_id);

const saving = ref(false);
provide('saving', saving);

const {
  capture_clipboard,
  copy_as_blob
} = useClipBoard(gen_id);

const {
  save_as,
  open_file_dialog,
  overwrite_file,
  target_file,
  target_files,
  overwrite_available,
  open_file_from_list,
  filename,
  original_filename
} = useFileSystem(gen_id);

import type {Point2D, Tool} from "./types.ts";
import TextToolOption from "./components/TextToolOption.vue";
import CircleToolOption from "./components/CircleToolOption.vue";
import LineToolOption from "./components/LineToolOption.vue";

const open_svg_handle = () => {
  open_file_dialog().then(() => {
    tool_store.set('');
    transformStore.reset_transform();

    commit(1);

    wipe();
  }).catch(() => {
    alert('FileSystemAPIに対応したブラウザを使用してください');
  });
};

const layer_offset: Point2D = {
  x: 5,
  y: 5
};

provide('layer-offset', layer_offset);

const overwrite_handle = () => {
  tool_store.set('');
  saving.value = true;
  transformStore.reset_transform();

  nextTick(() => {
    overwrite_file();
    saving.value = false;
  });
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
  if (wipe_available.value) {
    const do_wipe = confirm("画像以外の全要素を削除しますか？");
    if (do_wipe) {
      switch_tool('');
      transformStore.reset_transform();

      wipe();
    }
  }
};

const capture_clipboard_handle = async () => {
  capture_clipboard().then((_filename: string) => {
    switch_tool('');
    transformStore.reset_transform();

    document.title = _filename;
    target_file.value = null;
  }).catch(() => {
    alert('PrintScreenができていません');
  });
};

const save_as_handler = () => {
  switch_tool('');
  saving.value = true;
  transformStore.reset_transform();

  nextTick(() => {
    save_as(filename.value);
    saving.value = false;
  });
};

const copy_as_png_handler = () => {
  switch_tool('');
  saving.value = true;
  transformStore.reset_transform();

  nextTick(async () => {
    const data: Blob = await rasterize(
      '#svg_main',
      image_store.image.width + layer_offset.x * 2,
      image_store.image.height + layer_offset.y * 2
    );
    await copy_as_blob(data);
    alert('クリップボードにコピーしました');
    saving.value = false;
  });
};
</script>

<template lang="pug">
  .tool_options#tool_option
    circle-tool-option
    crop-tool-option
    text-tool-option
    line-tool-option
    view-port-option
  .container(:style="container_style")
    ToolRibbon(style="margin-right: 16px; width: 200px; height: 600px; float: left;")
      a.button(href="#" @click.prevent="open_svg_handle" draggable="false")
        img.tool_icon(src="/open.svg" draggable="false")
        span 画像を開く
      a.button(href="#" @click.prevent="capture_clipboard_handle" draggable="false")
        img.tool_icon(src="/paste.svg" draggable="false")
        span 新規貼り付け
      a.button(href="#" @click.prevent="wipe_handle" draggable="false" :class="wipe_available ? '' : 'disabled'")
        img.tool_icon(src="/wipe_all.svg" draggable="false")
        span 全消去
      a.button.sub(href="#" @click.prevent="switch_tool('erase')" :data-active="tool_store.current === 'erase'" draggable="false")
        img.tool_icon(src="/erase.svg" draggable="false")
        span 選択削除
      a.button(href="#" @click.prevent="apply_last_snapshot" draggable="false" :class="undo_available ? '' : 'disabled'")
        img.tool_icon(src="/undo.svg" draggable="false")
        span 元に戻す
      a.button(href="#" @click.prevent="switch_tool('pan')" :data-active="tool_store.current === 'pan'" draggable="false")
        img.tool_icon(src="/pan.svg" draggable="false")
        span パン
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
      a.button.sub(href="#" @click.prevent="overwrite_handle" draggable="false" :class="overwrite_available ? '' : 'disabled'")
        img.tool_icon(src="/save_overwrite.svg" draggable="false")
        span 上書き保存
      a.button(href="#" @click.prevent="copy_as_png_handler" draggable="false")
        img.tool_icon(src="/copy.svg" draggable="false")
        span PNGをコピー
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
