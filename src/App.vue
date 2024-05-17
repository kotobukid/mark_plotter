<script setup lang="ts">
import {nextTick} from "vue";
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";
import {getDataUrlAndDimensions, blobToDataURL, getClipboardImage} from "./clipboard_util.ts";
import {ref} from "vue";

import {type Tool, type ImageAndDimensions, type Circle, type Rect, type Line} from "./types.ts";

const tool = ref<Tool>("");
const image = ref<ImageAndDimensions>({
    dataUrl: '',
    width: 0,
    height: 0
});

const circles = ref<Circle[]>([]);
const rects = ref<Rect[]>([]);
const lines = ref<Line[]>([]);

const fileInput = ref(null);
const open_svg = () => {
    fileInput.value.click();
}
const handle_file_change = (event) => {
    const file = event.target.files[0];
    if (file) {
        const readFileContent = (file) => {

            const parseSvgContent = (content) => {
                console.log('Parsed SVG content:', content);
            };

            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target.result;
                console.log('SVG file content:', fileContent);
                parseSvgContent(fileContent);
            };
            reader.readAsText(file);
        };

        readFileContent(file);
    }
}

const capture_clipboard = async () => {
    tool.value = '';
    const data: Blob = await getClipboardImage();
    blobToDataURL(data).then(async (dataUrl) => {
        image.value = await getDataUrlAndDimensions(dataUrl);
    }).catch(() => {
        alert('PrintScreenができていません');
    });
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

const add_line = (l: Line) => {
    lines.value.push(l);
};

const wipe = () => {
    rects.value = [];
    circles.value = [];
    lines.value = [];
};
</script>

<template lang="pug">
    .container
        ToolRibbon(style="margin-bottom: 5px;")
            button(@click="open_svg") Open SVG
            input(type="file" ref="fileInput" accept=".svg" @change="handle_file_change" style="display:none")
            button(@click="capture_clipboard") Paste from Screenshot
            button(@click="wipe") Wipe
            button(@click="switch_tool('rect')" :data-active="tool === 'rect'") Rect tool
            button(@click="switch_tool('circle')" :data-active="tool === 'circle'") Circle tool
            button(@click="switch_tool('line')" :data-active="tool === 'line'") Line tool
            button(@click="save_as_svg") Save as SVG
        SvgPreview(
            :image="image"
            :tool="tool"
            :circles="circles"
            :rects="rects"
            :lines="lines"
            @switch-tool="switch_tool"
            @add-rect="add_rect"
            @add-circle="add_circle"
            @add-line="add_line"
        )
</template>

<style scoped>
button {
    margin: 2px;

    &[data-active="true"] {
        background-color: pink;
    }
}
</style>
