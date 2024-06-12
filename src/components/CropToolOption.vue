<script setup lang="ts">

import {useCropStore} from "../stores/crop.ts";
import {useImageStore} from "../stores/images.ts";
import {useToolStore} from "../stores/tool.ts";
import {useRectStore} from "../stores/rects.ts";
import {useCircleStore} from "../stores/circles.ts";
import {useEllipseStore} from "../stores/ellipses.ts";
import {useLineStore} from "../stores/lines.ts";
import {useTextStore} from "../stores/texts.ts";

import type {ImageAndDimensions, MyRect} from "../types.ts";
import {inject} from "vue";

const crop_store = useCropStore();
const image_store = useImageStore();
const rect_store = useRectStore();
const circle_store = useCircleStore();
const ellipse_store = useEllipseStore();
const line_store = useLineStore();
const text_store = useTextStore();
const tool_store = useToolStore();
const gen_id = inject('gen-id') as () => number;

const submit = () => {
  const crop_rect: MyRect = crop_store.commit();
  commit_crop(crop_rect);
};

const reset = () => {
  crop_store.reset();
  tool_store.set('');
};

const commit_crop = (rect: MyRect) => {
  trimImage(image_store.image.dataUrl, rect, (dataUrl: string) => {
    // image.value.dataUrl = dataUrl;
    // image.value.width = rect.width;
    // image.value.height = rect.height;

    circle_store.replace(circle_store.circles.map(c => {
      return {
        cx: c.cx - rect.x,
        cy: c.cy - rect.y,
        r: c.r,
        id: gen_id()
      };
    }));

    ellipse_store.replace(ellipse_store.ellipses.map(e => {
      return {
        cx: e.cx - rect.x,
        cy: e.cy - rect.y,
        rx: e.rx,
        ry: e.ry,
        id: gen_id()
      };
    }));

    rect_store.replace(rect_store.rects.map(r => {
      return {
        x: r.x - rect.x,
        y: r.y - rect.y,
        width: r.width,
        height: r.height,
        id: gen_id()
      };
    }));

    line_store.replace(line_store.lines.map(l => {
      return {
        x1: l.x1 - rect.x,
        y1: l.y1 - rect.y,
        x2: l.x2 - rect.x,
        y2: l.y2 - rect.y,
        id: gen_id()
      };
    }));

    text_store.replace(text_store.texts.map(t => {
      return {
        x: t.x - rect.x,
        y: t.y - rect.y,
        text: t.text,
        id: gen_id()
      };
    }));

    const image_cloned: ImageAndDimensions = {
      width: rect.width,
      height: rect.height,
      dataUrl,
      id: gen_id()
    };

    image_store.replace(image_cloned);

    // let new_image_index: number = image_map_manager.push(image_cloned);
    tool_store.set('');
    // commit_snapshot(take_snapshot(new_image_index));
  });
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

</script>

<template lang="pug">
  .option(v-if="tool_store.current === 'crop'")
    button(@click="reset") 解除
    button(@click="submit") 切り抜き確定
</template>

<style scoped lang="less">
button {
  cursor: pointer;
  font-size: 30px;
  margin-right: 5px;

  &:active {
    position: relative;
    top: 1px;
  }

  &:last-child {
    margin-right: 0;
  }
}
</style>