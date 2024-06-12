<script setup lang="ts">
import {computed, nextTick, ref, type Ref} from "vue";
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";
import FileList from "./components/FileList.vue";
import CropToolOption from "./components/CropToolOption.vue";
import {useClipBoardParser} from "./composables/clipboard.ts";
import {useHistoryManager} from "./composables/history_management.ts";
import {useToolStore} from "./stores/tool.ts";
import {useRectStore} from "./stores/rects.ts";
import {useCircleStore} from "./stores/circles.ts";
import {useEllipseStore} from "./stores/ellipses.ts";
import {useLineStore} from "./stores/lines.ts";
import {useTextStore} from "./stores/texts.ts";
import {useImageStore} from "./stores/images.ts";

const image_store = useImageStore();
const tool_store = useToolStore();
const rect_store = useRectStore();
const circle_store = useCircleStore();
const ellipse_store = useEllipseStore();
const line_store = useLineStore();
const text_store = useTextStore();


const {getDataUrlFromClipboard} = useClipBoardParser();
const {
  gen_id,
  commit_snapshot,
  wipe_snapshots,
  undo_enabled,
  pop_last_snapshot
} = useHistoryManager();

import type {
  ImageAndDimensions,
  MyCircle,
  MyRect,
  MyLine,
  MyEllipse,
  Snapshot,
  LabelText, EraseTarget, Tool,
} from "./types.ts";
import {parse_my_svg, parse_binary_image} from "./file_processing.ts";

const image = computed(() => image_store.image);
const rects = computed(() => rect_store.rects);
const circles = computed(() => circle_store.circles);
const ellipses = computed(() => ellipse_store.ellipses);
const lines = computed(() => line_store.lines);
const texts = computed(() => text_store.texts);

const image_map_manager = (() => {
  const image_map = new Map<number, ImageAndDimensions>();
  let index: number = 0;

  const push = (image: ImageAndDimensions): number => {
    index = index + 1;
    image_map.set(index, image);
    return index;
  };

  const get = (_index: number): ImageAndDimensions | null => {
    if (image_map.has(_index)) {
      return image_map.get(_index);
    } else {
      return null;
    }
  };

  const wipe = (): void => {
    image_map.clear();
    index = 0;
  };

  const dump = () => {
    console.log('dump start');
    for (let key of image_map.keys()) {
      const im = image_map.get(key);
      console.log(key)
      console.log({
        width: im.width,
        height: im.height
      });
    }
    console.log('dump end');
  }

  return {
    image_map,
    get,
    push,
    wipe,
    dump
  };
})();

const filename = ref('');
const original_filename = ref('');

const take_snapshot_by_child = (callback: Function) => {
  commit_snapshot(take_snapshot(-1));
  callback();
};

const take_snapshot = (image_changed: number | -1) => {
  const ss: Snapshot = {
    circles: [...circles.value],
    rects: [...rects.value],
    ellipses: [...ellipses.value],
    lines: [...lines.value],
    texts: [...texts.value],
    image_index: image_changed
  };
  return ss;
};

const apply_last_snapshot = () => {
  const ss = pop_last_snapshot();

  if (ss) {
    rect_store.replace(ss.rects);
    line_store.replace(ss.lines);
    circle_store.replace(ss.circles);
    ellipse_store.replace(ss.ellipses);
    text_store.replace(ss.texts);

    if (ss.image_index !== -1) {
      image_store.replace(image_map_manager.get(ss.image_index));
    }
  }
};


const open_svg = () => {
  open_file_dialog();
  wipe_snapshots();
};

const target_file: Ref<FileSystemFileHandle> = ref(null);
const target_files: Ref<FileSystemFileHandle[]> = ref([]);
const writable_handle = ref<FileSystemWritableFileStream>(null);

const open_file_dialog = async () => {
  const options = {
    types: [
      {
        description: 'Images',
        accept: {
          'image/*': ['.svg', '.png', '.jpg'],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: true
  };
  // @ts-ignore
  const a: FileSystemFileHandle[] = await window.showOpenFilePicker(options);
  target_files.value = a;

  await read_file(a[0]);
};

const read_file = async (fileHandle: FileSystemFileHandle) => {
  const file = await fileHandle.getFile();
  const fileContents = await file.text();
  target_file.value = fileHandle;
  filename.value = file.name;

  handle_file_change(file);
};

const handle_file_change = (file: File) => {
  if (file) {
    const readFileContent = (file) => {
      if (file.type === 'image/svg+xml') {
        parse_my_svg(file, (result) => {
          image_store.replace(result.image);
          rect_store.replace(result.rects);
          text_store.replace(result.texts);
          circle_store.replace(result.circles);
          ellipse_store.replace(result.ellipses);
          line_store.replace(result.lines);
          filename.value = result.filename;
          document.title = filename.value;
          original_filename.value = file.name;


          const image_cloned: ImageAndDimensions = {
            width: result.image.width,
            height: result.image.height,
            dataUrl: result.image.dataUrl,
            id: gen_id()
          };

          let new_image_index: number = image_map_manager.push(image_cloned);
          commit_snapshot(take_snapshot(new_image_index));
        }, gen_id);
      } else if (['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'].includes(file.type)) {
        parse_binary_image(file, (result) => {
          image_store.replace(result.image);
          rect_store.replace([]);
          text_store.replace([]);
          circle_store.replace([]);
          ellipse_store.replace([]);
          line_store.replace([]);
          filename.value = result.filename;
          document.title = filename.value;
          original_filename.value = file.name;


          const image_cloned: ImageAndDimensions = {
            width: result.image.width,
            height: result.image.height,
            dataUrl: result.image.dataUrl,
            id: gen_id()
          };

          let new_image_index: number = image_map_manager.push(image_cloned);
          commit_snapshot(take_snapshot(new_image_index));
        }, gen_id);
      }
    };

    readFileContent(file);
  }
};

const current_timestamp = () => {
  const now = new Date();

  return `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
};

const capture_clipboard = async () => {
  tool_store.set('');
  try {
    const _data: ImageAndDimensions = await getDataUrlFromClipboard();

    image_store.replace(_data);

    filename.value = `clipboard_${current_timestamp()}.svg`;
    document.title = filename.value;
    target_file.value = null;
    wipe_snapshots();

    const image_cloned: ImageAndDimensions = {
      ..._data,
      id: gen_id()
    };

    let new_image_index: number = image_map_manager.push(image_cloned);
    commit_snapshot(take_snapshot(new_image_index));
  } catch {
    alert('PrintScreenができていません');
  }
};

const can_overwrite = computed(() => {
  if (target_file.value && target_file.value.name) {
    return target_file.value.name.endsWith('.svg');
  } else {
    return false;
  }
});

const overwrite_file = async () => {
  if (can_overwrite.value) {
    const $svg_original = document.getElementById("svg_main").cloneNode(true) as HTMLElement;

    writable_handle.value = await target_file.value.createWritable();
    const file_content: string = await generate_svg_text_to_save($svg_original);
    await writable_handle.value.write(file_content);
    await writable_handle.value.close();
  }
};

const close_file = async () => {
  target_file.value = null;
  // text_content.value = '';
  filename.value = '';
};

const save_as = async () => {
  const $svg_original = document.getElementById("svg_main").cloneNode(true) as HTMLElement;

  const file_content: string = await generate_svg_text_to_save($svg_original);

  const option = {
    types: [
      {
        description: "SVGファイル",
        accept: {"image/svg+xml": [".svg"]},
      },
    ],
    suggestedName: filename.value
  };

  // @ts-ignore
  const fileHandle = await window.showSaveFilePicker(option);
  const writable = await fileHandle.createWritable();
  await writable.write(file_content);
  await writable.close();
};

const generate_svg_text_to_save = async ($svg_original: HTMLElement): Promise<string> => {
  return new Promise((resolve => {
    const $svg = $svg_original.cloneNode(true) as HTMLElement;

    const remove_data_attribute = ($elem: HTMLElement) => {
      // 最初に、削除する属性を収集
      const attributesToRemove = [];
      for (const attr of $elem.attributes) {
        if (attr.name.startsWith('data-')) {
          attributesToRemove.push(attr.name);
        }
      }

      // 収集した属性を削除
      attributesToRemove.forEach(attr => {
        console.log(attr);
        $elem.removeAttribute(attr);
      });
    };

    remove_data_attribute($svg);

    const elements = $svg.querySelectorAll('*');

    // 各要素からdata-v-xxx属性を削除
    elements.forEach((element: HTMLElement) => {
      remove_data_attribute(element);
    });

    // @ts-ignore
    $svg.removeAttribute!('style');
    // $svg.addAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink")

    const text: string = $svg.outerHTML!;
    resolve(`<?xml version="1.0" encoding="utf-8" ?>
${text}`);

//     const download_text_as_file = (text: string) => {
//       const blob = new Blob([`<?xml version="1.0" encoding="utf-8" ?>
// ${text}`], {type: 'image/svg+xml'});
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.target = '_blank';
//       link.download = filename.value || `download.svg`;
//       link.click();
//       URL.revokeObjectURL(link.href);
//       setTimeout(() => {
//         link.remove();
//       });
//     };
  }));
};

const save_as_svg = () => {
  tool_store.set('');
  nextTick(() => {
    const $svg = document.getElementById("svg_main").cloneNode(true) as HTMLElement;

    const remove_data_attribute = ($elem: HTMLElement) => {
      // 最初に、削除する属性を収集
      const attributesToRemove = [];
      for (const attr of $elem.attributes) {
        if (attr.name.startsWith('data-')) {
          attributesToRemove.push(attr.name);
        }
      }

      // 収集した属性を削除
      attributesToRemove.forEach(attr => {
        console.log(attr);
        $elem.removeAttribute(attr);
      });
    };

    remove_data_attribute($svg);

    const elements = $svg.querySelectorAll('*');

    // 各要素からdata-v-xxx属性を削除
    elements.forEach((element: HTMLElement) => {
      remove_data_attribute(element);
    });

    // @ts-ignore
    $svg.removeAttribute!('style');
    // $svg.addAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink")

    const text: string = $svg.outerHTML!;

    const download_text_as_file = (text: string) => {
      const blob = new Blob([`<?xml version="1.0" encoding="utf-8" ?>
${text}`], {type: 'image/svg+xml'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.target = '_blank';
      link.download = filename.value || `download.svg`;
      link.click();
      URL.revokeObjectURL(link.href);
      setTimeout(() => {
        link.remove();
      });
    };
    download_text_as_file(text);
  });
};

const switch_tool = (_tool: Tool) => {
  tool_store.set(_tool);
};

const add_rect = (r: MyRect) => {
  commit_snapshot(take_snapshot(-1));
  rect_store.create(r);
};


const add_circle = (c: MyCircle) => {
  commit_snapshot(take_snapshot(-1));
  c.id = gen_id();
  circle_store.create(c);
};

const add_line = (l: MyLine) => {
  commit_snapshot(take_snapshot(-1));
  l.id = gen_id();
  line_store.create(l);
};

const add_ellipse = (e: MyEllipse) => {
  commit_snapshot(take_snapshot(-1));
  e.id = gen_id();
  ellipse_store.create(e);
};

const wipe = () => {
  const do_wipe = confirm("画像以外の全要素を削除しますか？");
  if (do_wipe) {
    commit_snapshot(take_snapshot(-1));
    rect_store.replace([]);
    circle_store.replace([]);
    line_store.replace([]);
    ellipse_store.replace([]);
    text_store.replace([]);
  }
};

const container_style = computed(() => {
  return `width: ${220 + (image.value.width || 0) + 20}px;`;
});

const open_file_from_list = async (f: FileSystemFileHandle) => {
  const file = await f.getFile();
  target_file.value = f;
  handle_file_change(file);
};

const clear_files = (): void => {
  target_files.value = [];
};

const erase_element = ({cat, id}: EraseTarget): void => {
  commit_snapshot(take_snapshot(-1));

  if (cat === 'rect') {
    // rect_store.remove_rect_by_id(id);
  } else if (cat === 'circle') {
    // circles.value = circles.value.filter(el => el.id !== id);
  } else if (cat === 'ellipse') {
    // ellipse_store.erase(id);
  } else if (cat === 'line') {
    // lines.value = lines.value.filter(el => el.id !== id);
  } else if (cat === 'text') {
    // texts.value = texts.value.filter(el => el.id !== id);
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
    text_store.replace(_texts);
  } else {
    // new
    t.text = t
      .text.replace(/\</, '＜')
      .replace(/\>/, '＞')
    t.id = gen_id();
    text_store.create(t);
  }
};
</script>

<template lang="pug">
  .tool_options#tool_option
    crop-tool-option
  .container(:style="container_style")
    ToolRibbon(style="margin-right: 16px; width: 200px; height: 600px; float: left;")
      a.button(href="#" @click.prevent="open_svg" draggable="false")
        img.tool_icon(src="/open.svg" draggable="false")
        span 画像を開く
      a.button(href="#" @click.prevent="capture_clipboard" draggable="false")
        img.tool_icon(src="/paste.svg" draggable="false")
        span 新規貼り付け
      a.button(href="#" @click.prevent="wipe" draggable="false")
        img.tool_icon(src="/wipe_all.svg" draggable="false")
        span 全消去
      a.button.sub(href="#" @click.prevent="switch_tool('erase')" :data-active="tool_store.current === 'erase'" draggable="false")
        img.tool_icon(src="/erase.svg" draggable="false")
        span 選択削除
      a.button(href="#" @click.prevent="apply_last_snapshot" draggable="false" :class="undo_enabled ? '' : 'disabled'")
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
      a.button(href="#" @click.prevent="save_as" draggable="false")
        img.tool_icon(src="/save.svg" draggable="false")
        span SVGを新規保存
      a.button.sub(href="#" @click.prevent="overwrite_file" draggable="false" :class="can_overwrite ? '' : 'disabled'")
        img.tool_icon(src="/save_overwrite.svg" draggable="false")
        span 上書き保存
    SvgPreview(
      style="float: left;"
      :image="image"
      :texts="texts"
      :lines="lines"
      @take-snapshot="take_snapshot_by_child"
      @add-text="add_text"
      @add-circle="add_circle"
      @add-line="add_line"
      @add-ellipse="add_ellipse"
      @erase-element="erase_element"
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

  &.disabled {
    background-color: grey;
    color: black;
    cursor: not-allowed;

    &:active {
      position: relative;
      top: 0;
    }

    &:hover {
      background-color: grey;
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
