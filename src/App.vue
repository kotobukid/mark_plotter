<script setup lang="ts">
import {nextTick} from "vue";
import SvgPreview from "./components/SvgPreview.vue";
import ToolRibbon from "./components/ToolRibbon.vue";
import {getDataUrlAndDimensions, blobToDataURL, getClipboardImage} from "./clipboard_util.ts";
import {ref} from "vue";

import {type Tool, type ImageAndDimensions, type Circle, type Rect, type Line, type Ellipse, type Snapshot} from "./types.ts";

const tool = ref<Tool>("");
const image = ref<ImageAndDimensions>({
    dataUrl: '',
    width: 0,
    height: 0
});

const circles = ref<Circle[]>([]);
const rects = ref<Rect[]>([]);
const lines = ref<Line[]>([]);
const ellipses = ref<Ellipse[]>([]);

const snapshots = ref<Snapshot>([]);

const commit_snapshot = () => {
    const ss = {
        circles: [...circles.value],
        rects: [...rects.value],
        ellipses: [...ellipses.value],
        lines: [...lines.value],
    };
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
    }
};


const fileInput = ref(null);
const open_svg = () => {
    fileInput.value.click();
    wipe_snapshots();
};

const handle_file_change = (event) => {
    const file = event.target.files[0];
    if (file) {
        const readFileContent = (file) => {

            const parseSvgContent = (content) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, "image/svg+xml");

                // Image
                const elements = doc.querySelectorAll('image.main_image'); // ここで必要なクラス名を指定するにゃ

                elements.forEach(element => {
                    const dataUrl = element.getAttribute('href');
                    const width = element.getAttribute('width');
                    const height = element.getAttribute('height');

                    image.value = {
                        dataUrl,
                        width,
                        height
                    };
                });

                // Rect
                const g_rects = doc.querySelector('g.rects'); // 必要に応じてクラス名を変更するにゃ
                if (g_rects) {
                    const _rects = g_rects.querySelectorAll('rect');
                    rects.value = Array.from(_rects).map(rect => {
                        return {
                            x: rect.getAttribute('x'),
                            y: rect.getAttribute('y'),
                            width: rect.getAttribute('width'),
                            height: rect.getAttribute('height')
                        };
                    });
                }

                // Circle
                const g_circles = doc.querySelector('g.circles');
                if (g_circles) {
                    const _circles = g_circles.querySelectorAll('circle');
                    circles.value = Array.from(_circles).map(circle => {
                        return {
                            cx: circle.getAttribute('cx'),
                            cy: circle.getAttribute('cy'),
                            r: circle.getAttribute('r'),
                        };
                    });
                }

                // Ellipse
                const g_ellipses = doc.querySelector('g.ellipses');
                if (g_ellipses) {
                    const _ellipses = g_ellipses.querySelectorAll('ellipse');
                    ellipses.value = Array.from(_ellipses).map(ellipse => {
                        return {
                            cx: ellipse.getAttribute('cx'),
                            cy: ellipse.getAttribute('cy'),
                            rx: ellipse.getAttribute('rx'),
                            ry: ellipse.getAttribute('ry'),
                        };
                    });
                }

                // Lines
                const g_lines = doc.querySelector('g.lines');
                if (g_lines) {
                    const _lines = g_lines.querySelectorAll('line');
                    lines.value = Array.from(_lines).map(line => {
                        return {
                            x1: line.getAttribute('x1'),
                            y1: line.getAttribute('y1'),
                            x2: line.getAttribute('x2'),
                            y2: line.getAttribute('y2'),
                        };
                    });
                }
            };

            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target.result;
                // console.log('SVG file content:', fileContent);
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
        wipe_snapshots();
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
    commit_snapshot();
    rects.value.push(r);
};

const add_circle = (c: Circle) => {
    commit_snapshot();
    circles.value.push(c);
};

const add_line = (l: Line) => {
    commit_snapshot();
    lines.value.push(l);
};

const add_ellipse = (e: Ellipse) => {
    commit_snapshot();
    ellipses.value.push(e);
};

const wipe = () => {
    const do_wipe = confirm("画像以外の全要素を削除しますか？", "");
    if (do_wipe) {
        commit_snapshot();
        rects.value = [];
        circles.value = [];
        lines.value = [];
        ellipses.value = [];
    }
};

const trimImage = (dataUrl: string, {x, y, width, height}: Rect, callback) => {
    let img = new Image();
    img.src = dataUrl;

    img.onload = function() {
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

const commit_crop = (rect: Rect) => {
    trimImage(image.value.dataUrl, rect, (dataUrl: string) => {
        image.value.dataUrl = dataUrl;
        image.value.width = rect.width;
        image.value.height = rect.height;

        circles.value = circles.value.map(c => {
            return {
                cx : c.cx - rect.x,
                cy : c.cy - rect.y,
                r: c.r
            };
        });

        ellipses.value = ellipses.value.map(e => {
            return {
                cx : e.cx - rect.x,
                cy : e.cy - rect.y,
                rx: e.rx,
                ry: e.ry
            };
        });

        rects.value = rects.value.map(r => {
            return {
                x : r.x - rect.x,
                y : r.y - rect.y,
                width: r.width,
                height: r.height
            };
        });

        lines.value = lines.value.map(l => {
            return {
                x1 : l.x1 - rect.x,
                y1 : l.y1 - rect.y,
                x2 : l.x2 - rect.x,
                y2 : l.y2 - rect.y,
            };
        });
    });
}
</script>

<template lang="pug">
    .container
        ToolRibbon(style="margin-bottom: 16px;")
            a.button(href="#" @click.prevent="open_svg" draggable="false")
                img.tool_icon(src="/public/open.svg" draggable="false")
                span SVGを開く
            input(type="file" ref="fileInput" accept=".svg" @change="handle_file_change" style="display:none")
            a.button(href="#" @click.prevent="capture_clipboard" draggable="false")
                img.tool_icon(src="/public/paste.svg" draggable="false")
                span 貼り付け
            a.button(href="#" @click.prevent="wipe" draggable="false")
                img.tool_icon(src="/public/wipe.svg" draggable="false")
                span 全消去
            a.button(href="#" @click.prevent="load_last_snapshot" draggable="false" :class="snapshots.length > 0 ? '' : 'disabled'")
                img.tool_icon(src="/public/undo.svg" draggable="false")
                span やり直し
            a.button(href="#" @click.prevent="switch_tool('crop')" :data-active="tool === 'crop'" draggable="false")
                img.tool_icon(src="/public/crop.svg" draggable="false")
                span 切り抜きツール
            a.button(href="#" @click.prevent="switch_tool('rect')" :data-active="tool === 'rect'" draggable="false")
                img.tool_icon(src="/public/rect.svg" draggable="false")
                span 矩形ツール
            a.button(href="#" @click.prevent="switch_tool('circle')" :data-active="tool === 'circle'" draggable="false")
                img.tool_icon(src="/public/circle.svg" draggable="false")
                span 円ツール
            a.button(href="#" @click.prevent="switch_tool('ellipse')" :data-active="tool === 'ellipse'" draggable="false")
                img.tool_icon(src="/public/ellipse.svg" draggable="false")
                span 楕円ツール
            a.button(href="#" @click.prevent="switch_tool('line')" :data-active="tool === 'line'" draggable="false")
                img.tool_icon(src="/public/line.svg" draggable="false")
                span 矢印ツール
            a.button(href="#" @click.prevent="save_as_svg" draggable="false")
                img.tool_icon(src="/public/save.svg" draggable="false")
                span SVGを保存
        SvgPreview(
            :image="image"
            :tool="tool"
            :circles="circles"
            :rects="rects"
            :lines="lines"
            :ellipses="ellipses"
            @switch-tool="switch_tool"
            @add-rect="add_rect"
            @add-circle="add_circle"
            @add-line="add_line"
            @add-ellipse="add_ellipse"
            @commit-crop="commit_crop"
        )
</template>

<style scoped>
a.button {
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
    margin: 2px 10px;

    &[data-active="true"] {
        background-color: pink;
    }

    display: inline-block;
    background-color: white;
    border: 1px solid black;
    border-radius: 3px;
    padding: 3px;
}

img.tool_icon {
    width: 2rem;
    height: 2rem;
}
</style>
