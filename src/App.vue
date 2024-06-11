<script setup lang="ts">
import {computed, nextTick} from "vue";
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";
import FileList from "./components/FileList.vue";
import {getDataUrlAndDimensions, blobToDataURL, getClipboardImage} from "./clipboard_util.ts";
import {ref} from "vue";
import CropToolOption from "./components/CropToolOption.vue";

import type {
  Tool,
  ImageAndDimensions,
  MyCircle,
  MyRect,
  MyLine,
  MyEllipse,
  Snapshot,
  LabelText, EraseTarget,
} from "./types.ts";
import {parse_my_svg, parse_binary_image} from "./file_processing.ts";

const tool = ref<Tool>("");
const image = ref<ImageAndDimensions>({
  dataUrl: '',
  width: 0,
  height: 0,
  id: 0
});

const circles = ref<MyCircle[]>([]);
const rects = ref<MyRect[]>([]);
const texts = ref<LabelText[]>([]);
const lines = ref<MyLine[]>([]);
const ellipses = ref<MyEllipse[]>([]);

let {gen_id} = (() => {
  let id: number = 0;
  return {
    gen_id: (): number => {
      id = id + 1;
      return id;
    }
  };
})();

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

const snapshots = ref<Snapshot[]>([] as Snapshot[]);

const commit_snapshot = (image_changed: number | -1) => {
  const ss: Snapshot = {
    circles: [...circles.value],
    rects: [...rects.value],
    ellipses: [...ellipses.value],
    lines: [...lines.value],
    texts: [...texts.value],
    image_index: image_changed
  };

  // image_map_manager.dump();

  snapshots.value = [...snapshots.value, ss];
};

const wipe_snapshots = () => {
  snapshots.value = [];
};

const load_last_snapshot = () => {
  const ss = snapshots.value.pop();

  if (ss) {
    rects.value = ss.rects;
    lines.value = ss.lines;
    circles.value = ss.circles;
    ellipses.value = ss.ellipses;
    texts.value = ss.texts;

    if (ss.image_index !== -1) {
      image.value = image_map_manager.get(ss.image_index);
    }
  }
};


const fileInput = ref(null);
const open_svg = () => {
  fileInput.value.click();
  wipe_snapshots();
};

const handle_file_change = (file: File) => {
  if (file) {
    const readFileContent = (file) => {
      if (file.type === 'image/svg+xml') {
        parse_my_svg(file, (result) => {
          image.value = result.image;
          rects.value = result.rects;
          texts.value = result.texts;
          circles.value = result.circles;
          ellipses.value = result.ellipses;
          lines.value = result.lines;
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
          commit_snapshot(new_image_index);
        }, gen_id);
      } else if (['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'].includes(file.type)) {
        parse_binary_image(file, (result) => {
          image.value = result.image;
          rects.value = [];
          texts.value = [];
          circles.value = [];
          ellipses.value = [];
          lines.value = [];
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
          commit_snapshot(new_image_index);
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
  tool.value = '';
  const data: Blob = await getClipboardImage();
  blobToDataURL(data).then(async (dataUrl) => {
    image.value = await getDataUrlAndDimensions(dataUrl, gen_id);
    filename.value = `clipboard_${current_timestamp()}.svg`;
    document.title = filename.value;
    wipe_snapshots();

    const image_cloned: ImageAndDimensions = {
      width: image.value.width,
      height: image.value.height,
      dataUrl,
      id: gen_id()
    };

    let new_image_index: number = image_map_manager.push(image_cloned);
    commit_snapshot(new_image_index);

  }).catch(() => {
    alert('PrintScreenができていません');
  });
};

const save_as_svg = () => {
  tool.value = '';
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
  tool.value = _tool;
};

const add_rect = (r: MyRect) => {
  r.id = gen_id();
  commit_snapshot(-1);
  rects.value.push(r);
};

const add_text = (t: LabelText) => {
  commit_snapshot(-1);

  if (t.id !== -1) {
    // edit
    const _texts = texts.value.concat([]);
    for (let i = 0; i < _texts.length; i++) {
      if (_texts[i].id === t.id) {
        _texts[i].text = t.text;
        break;
      }
    }
    texts.value = _texts;
  } else {
    // new
    t.text = t
      .text.replace(/\</, '＜')
      .replace(/\>/, '＞')
    t.id = gen_id();
    texts.value.push(t);
  }
};

const add_circle = (c: MyCircle) => {
  commit_snapshot(-1);
  c.id = gen_id();
  circles.value.push(c);
};

const add_line = (l: MyLine) => {
  commit_snapshot(-1);
  l.id = gen_id();
  lines.value.push(l);
};

const add_ellipse = (e: MyEllipse) => {
  commit_snapshot(-1);
  e.id = gen_id();
  ellipses.value.push(e);
};

const wipe = () => {
  const do_wipe = confirm("画像以外の全要素を削除しますか？");
  if (do_wipe) {
    commit_snapshot(-1);
    rects.value = [];
    circles.value = [];
    lines.value = [];
    ellipses.value = [];
    texts.value = [];
  }
};

const trimImage = (dataUrl: string, {x, y, width, height}: MyRect, callback) => {
  let img = new Image();
  img.src = dataUrl;

  img.onload = function () {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');

    // Draw the image onto the canvas, but only the desired section
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    // Get the dataURL of the trimmed section
    let trimmedDataUrl = canvas.toDataURL();

    callback(trimmedDataUrl);
  };
}

const commit_crop = (rect: MyRect) => {
  trimImage(image.value.dataUrl, rect, (dataUrl: string) => {
    image.value.dataUrl = dataUrl;
    image.value.width = rect.width;
    image.value.height = rect.height;

    circles.value = circles.value.map(c => {
      return {
        cx: c.cx - rect.x,
        cy: c.cy - rect.y,
        r: c.r,
        id: gen_id()
      };
    });

    ellipses.value = ellipses.value.map(e => {
      return {
        cx: e.cx - rect.x,
        cy: e.cy - rect.y,
        rx: e.rx,
        ry: e.ry,
        id: gen_id()
      };
    });

    rects.value = rects.value.map(r => {
      return {
        x: r.x - rect.x,
        y: r.y - rect.y,
        width: r.width,
        height: r.height,
        id: gen_id()
      };
    });

    lines.value = lines.value.map(l => {
      return {
        x1: l.x1 - rect.x,
        y1: l.y1 - rect.y,
        x2: l.x2 - rect.x,
        y2: l.y2 - rect.y,
        id: gen_id()
      };
    });

    texts.value = texts.value.map(t => {
      return {
        x: t.x - rect.x,
        y: t.y - rect.y,
        text: t.text,
        id: gen_id()
      };
    });

    const image_cloned: ImageAndDimensions = {
      width: rect.width,
      height: rect.height,
      dataUrl,
      id: gen_id()
    };

    let new_image_index: number = image_map_manager.push(image_cloned);
    tool.value = '';
    commit_snapshot(new_image_index);
  });
};

const container_style = computed(() => {
  return `width: ${220 + (image.value.width || 0) + 20}px;`;
});


const target_files = ref<File[]>([]);
const can_accept_drop = ref(false);

const dragenter = (e: DragEvent): void => {
  can_accept_drop.value = true;
  // if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
  //   console.log('ドラッグ行為がローカルファイルシステム上のファイルを抱えています');
  // }
};

const dragleave = (): void => {
  can_accept_drop.value = false;
};

const files_dropped = (e: DragEvent): void => {
  if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
    const _files: File[] = Array.from(e.dataTransfer.files)
    if (_files.length === 1) {
      handle_file_change(_files[0]);
    } else {
      // @ts-ignore
      target_files.value = _files;
    }
  }
  can_accept_drop.value = false;
};

const noop = (e: DragEvent): void => {
};

const open_file = (f: File): void => {
  handle_file_change(f);
};

const clear_files = (): void => {
  target_files.value = [];
};

const handle_file_change_direct = (event: Event): void => {
  // @ts-ignore
  if (event.target.files && event.target.files.length > 0) {
    // @ts-ignore
    const file: File = event.target.files[0]!;
    handle_file_change(file);
    // @ts-ignore
    target_files.value = Array.from(event.target.files! || []);
  }
};

const erase_element = ({cat, id}: EraseTarget): void => {
  commit_snapshot(-1);

  if (cat === 'rect') {
    rects.value = rects.value.filter(el => el.id !== id);
  } else if (cat === 'circle') {
    circles.value = circles.value.filter(el => el.id !== id);
  } else if (cat === 'ellipse') {
    ellipses.value = ellipses.value.filter(el => el.id !== id);
  } else if (cat === 'line') {
    lines.value = lines.value.filter(el => el.id !== id);
  } else if (cat === 'text') {
    texts.value = texts.value.filter(el => el.id !== id);
  }
};

</script>

<template lang="pug">
  .tool_options#tool_option
    crop-tool-option(
      :tool="tool"
      @commit-crop="commit_crop"
    )
  .outer_frame(@dragenter="dragenter" @dragleave="dragleave" @dragover.prevent.stop="noop" @drop.prevent.stop="files_dropped" :data-accept-drop="can_accept_drop")
    .container(:style="container_style")
      ToolRibbon(style="margin-right: 16px; width: 200px; height: 600px; float: left;")
        a.button(href="#" @click.prevent="open_svg" draggable="false")
          img.tool_icon(src="/open.svg" draggable="false")
          span 画像を開く
        input(:multiple="true" type="file" ref="fileInput" accept=".svg, .png, .jpg, .jpeg, .bmp" @change="handle_file_change_direct" style="display:none")
        a.button(href="#" @click.prevent="capture_clipboard" draggable="false")
          img.tool_icon(src="/paste.svg" draggable="false")
          span 新規貼り付け
        a.button(href="#" @click.prevent="wipe" draggable="false")
          img.tool_icon(src="/wipe_all.svg" draggable="false")
          span 全消去
        a.button.sub(href="#" @click.prevent="switch_tool('erase')" :data-active="tool === 'erase'" draggable="false")
          img.tool_icon(src="/erase.svg" draggable="false")
          span 選択削除
        a.button(href="#" @click.prevent="load_last_snapshot" draggable="false" :class="snapshots.length > 0 ? '' : 'disabled'")
          img.tool_icon(src="/undo.svg" draggable="false")
          span 元に戻す
        a.button(href="#" @click.prevent="switch_tool('crop')" :data-active="tool === 'crop'" draggable="false")
          img.tool_icon(src="/crop.svg" draggable="false")
          span 切り抜きツール
        a.button(href="#" @click.prevent="switch_tool('rect')" :data-active="tool === 'rect'" draggable="false")
          img.tool_icon(src="/rect.svg" draggable="false")
          span 矩形ツール
        a.button(href="#" @click.prevent="switch_tool('circle')" :data-active="tool === 'circle'" draggable="false")
          img.tool_icon(src="/circle.svg" draggable="false")
          span 円ツール
        a.button(href="#" @click.prevent="switch_tool('ellipse')" :data-active="tool === 'ellipse'" draggable="false")
          img.tool_icon(src="/ellipse.svg" draggable="false")
          span 楕円ツール
        a.button(href="#" @click.prevent="switch_tool('line')" :data-active="tool === 'line'" draggable="false")
          img.tool_icon(src="/line.svg" draggable="false")
          span 矢印ツール
        a.button(href="#" @click.prevent="switch_tool('text')" :data-active="tool === 'text'" draggable="false")
          img.tool_icon(src="/text.svg" draggable="false")
          span テキストツール
        a.button.sub(href="#" @click.prevent="switch_tool('edit')" :data-active="tool === 'edit'" draggable="false")
          img.tool_icon(src="/edit.svg" draggable="false")
          span 再編集ツール
        a.button(href="#" @click.prevent="save_as_svg" draggable="false")
          img.tool_icon(src="/save.svg" draggable="false")
          span SVGを保存
      SvgPreview(
        style="float: left;"
        :image="image"
        :tool="tool"
        :circles="circles"
        :rects="rects"
        :texts="texts"
        :lines="lines"
        :ellipses="ellipses"
        @switch-tool="switch_tool"
        @add-rect="add_rect"
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
      @open-file="open_file"
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
}

.outer_frame {
  padding: 8px 8px 8px 0;
  height: 100%;

  padding-top: @tool_option_height + 18px;

  background-color: white;

  &[data-accept-drop="true"] {
    background-color: lightgreen;
    outline: 3px doubled green;
  }
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
