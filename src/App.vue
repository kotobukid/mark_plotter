<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";

type Tool = "" | "circle";
type ImageAndDimensions = {
    dataUrl: string,
    width: number,
    height: number
};

const tool = ref<Tool>("");
const image = ref<ImageAndDimensions>({
    dataUrl: '',
    width: 0,
    height: 0
});

import {getDataUrlAndDimensions, blobToDataURL, getClipboardImage} from "./clipboard_util.ts";
import {ref} from "vue";

const capture_clipboard = async () => {
    tool.value = '';
    const data: Blob = await getClipboardImage();
    const dataUrl = await blobToDataURL(data);
    // addImageToSvg(dataUrl);
    image.value = await getDataUrlAndDimensions(dataUrl);
};

const switch_to_circle_tool = () => {
    tool.value = 'circle';
};

const save_as_svg = () => {
    const $svg = document.getElementById("svg_main");
    const text = $svg.outerHTML;

    const download_text_as_file = (text) => {
        const blob = new Blob([text], {type: 'image/svg+xml'});
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
}
</script>

<template lang="pug">
    .container
        ToolRibbon(style="margin-bottom: 5px;")
            button(@click="capture_clipboard") Paste from Screenshot
            button(@click="switch_to_circle_tool") Circle tool
            button(@click="save_as_svg") Save as SVG
        SvgPreview(
            :image="image"
            :tool="tool"
        )
</template>

<style scoped>
button {
    margin: 2px;
}
</style>
