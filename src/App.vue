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
    tool.value = 'circle'
}
</script>

<template lang="pug">
.container
    ToolRibbon(style="margin-bottom: 5px;")
        button(@click="capture_clipboard") Paste from Screenshot
        button(@click="switch_to_circle_tool") Circle tool
    SvgPreview(
        :image="image"
        :tool="tool"
    )
</template>

<style scoped>
.logo.vite:hover {
    filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #249b73);
}
</style>
