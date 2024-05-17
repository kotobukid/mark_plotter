<script setup lang="ts">
import {nextTick} from "vue";
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";

import {type Tool, type ImageAndDimensions, type Circle, type Rect} from "./types.ts";

const tool = ref<Tool>("");
const image = ref<ImageAndDimensions>({
    dataUrl: '',
    width: 0,
    height: 0
});

const circles = ref<Circle[]>([]);
const rects = ref<Rect[]>([]);

import {getDataUrlAndDimensions, blobToDataURL, getClipboardImage} from "./clipboard_util.ts";
import {ref} from "vue";

const capture_clipboard = async () => {
    tool.value = '';
    const data: Blob = await getClipboardImage();
    const dataUrl = await blobToDataURL(data);
    // addImageToSvg(dataUrl);
    image.value = await getDataUrlAndDimensions(dataUrl);
};

const save_as_svg = () => {
    tool.value = '';
    nextTick(() => {
        const $svg = document.getElementById("svg_main").cloneNode(true);

        const remove_data_custom_attrs = (elem, attrToRemove) => {
            // 指定した属性を削除します。
            elem.removeAttribute(attrToRemove);

            // 全ての子要素に対して同じ操作を行います。
            for (let i = 0; i < elem.children.length; i++) {
                remove_data_custom_attrs(elem.children[i], attrToRemove);
            }
        };

        for (let attr of $svg.attributes) {
            if (attr.name.startsWith('data-')) {
                remove_data_custom_attrs($svg, attr.name);
            }
        }

        const text = $svg.outerHTML;

        const download_text_as_file = (text) => {
            const blob = new Blob([`<?xml version="1.0" encoding="UTF-8" standalone="no"?>${text}`], {type: 'image/svg+xml'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.target = '_blank';
            link.download = `download.svg`;
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

const add_rect = (r: Rect) => {
    rects.value.push(r);
};

const add_circle = (c: Circle) => {
    circles.value.push(c);
};
</script>

<template lang="pug">
    .container
        ToolRibbon(style="margin-bottom: 5px;")
            button(@click="capture_clipboard") Paste from Screenshot
            button(@click="switch_tool('rect')") Rect tool
            button(@click="switch_tool('circle')") Circle tool
            button(@click="save_as_svg") Save as SVG
        SvgPreview(
            :image="image"
            :tool="tool"
            :circles="circles"
            :rects="rects"
            @switch-tool="switch_tool"
            @add-rect="add_rect"
            @add-circle="add_circle"
        )
</template>

<style scoped>
button {
    margin: 2px;
}
</style>
