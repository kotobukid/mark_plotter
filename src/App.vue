<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";

import {addImageToSvg, blobToDataURL, getClipboardImage} from "./clipboard_util.ts";

const capture_clipboard = async () => {
  const data: Blob = await getClipboardImage();
  const dataUrl = await blobToDataURL(data);
  addImageToSvg(dataUrl);
}
</script>

<template lang="pug">
  .container
    ToolRibbon(style="margin-bottom: 5px;")
      button(@click="capture_clipboard") Paste from Screenshot
    SvgPreview
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}
</style>
