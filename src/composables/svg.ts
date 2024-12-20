import {nextTick} from "vue";
import vkbeautify from 'vkbeautify';
import type {
    ApplicationImage,
    ArrowDirection,
    ImageAndDimensions,
    LabelText,
    MyCircle,
    MyEllipse,
    MyLine,
    MyRect,
    Mask
} from "../types.ts";

export const useSVG = () => {
    const generate_svg_text_to_save = async ($svg_original: HTMLElement): Promise<string> => {
        return new Promise((resolve => {
            const $svg: HTMLElement = $svg_original.cloneNode(true) as HTMLElement;

            const remove_data_attribute = ($elem: HTMLElement) => {
                // 最初に、削除する属性を収集
                const attributesToRemove: string[] = [];
                for (const attr of $elem.attributes) {
                    if (attr.name.startsWith('data-')) {
                        attributesToRemove.push(attr.name);
                    }
                }

                // 収集した属性を削除
                attributesToRemove.forEach(attr => {
                    $elem.removeAttribute(attr);
                });
            };

            const remove_comments = ($elem: Node) => {
                const commentsToRemove: ChildNode[] = []
                for (const node of $elem.childNodes) {
                    if (node.nodeType === Node.COMMENT_NODE) {
                        commentsToRemove.push(node);
                    } else {
                        remove_comments(node);
                    }
                }

                commentsToRemove.forEach(node => {
                    $elem.removeChild(node);
                });
            };

            remove_comments($svg);
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
            const pretty_text = vkbeautify.xml(text, 2);
            resolve(`<?xml version="1.0" encoding="utf-8" ?>
${pretty_text}`);
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

    const download_as_svg = (filename_to_save: string) => {
        const filename = filename_to_save || `download.svg`
        // tool_store.set('');
        nextTick(() => {
            const $svg: HTMLElement = document.getElementById("svg_main").cloneNode(true) as HTMLElement;

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
                const blob: Blob = new Blob([`<?xml version="1.0" encoding="utf-8" ?>
${text}`], {type: 'image/svg+xml'});
                const link: HTMLAnchorElement = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.target = '_blank';
                link.download = filename;
                link.click();
                URL.revokeObjectURL(link.href);
                setTimeout(() => {
                    link.remove();
                });
            };
            download_text_as_file(text);
        }).then();
    };

    const parse_my_svg = (file: File, next: (data: ApplicationImage) => void, gen_id: () => number) => {
        const parseSvgContent = (content: string) => {  // readAsStringしているためstring
            const parser: DOMParser = new DOMParser();
            const doc: Document = parser.parseFromString(content, "image/svg+xml");
            const elements = doc.querySelectorAll('image.main_image');

            let is_my_svg: boolean = elements.length === 1;

            if (is_my_svg) {

                let image: ImageAndDimensions = {
                    dataUrl: '',
                    width: 0,
                    height: 0,
                    id: gen_id()
                };

                elements.forEach(element => {
                    const href = element.getAttribute('href');
                    const dataUrl = href ? href : element.getAttribute('xlink:href');
                    const width = Number(element.getAttribute('width'));
                    const height = Number(element.getAttribute('height'));

                    image = {
                        dataUrl,
                        width,
                        height,
                        id: gen_id()
                    };
                });

                let rects: MyRect[] = [];

                // Rect
                const g_rects = doc.querySelector('g.rects');
                if (g_rects) {
                    const _rects = g_rects.querySelectorAll('rect');
                    rects = Array.from(_rects).map(rect => {
                        return {
                            x: Number(rect.getAttribute('x')),
                            y: Number(rect.getAttribute('y')),
                            width: Number(rect.getAttribute('width')),
                            height: Number(rect.getAttribute('height')),
                            id: gen_id()
                        };
                    });
                }

                let masks: Mask[] = [];

                // Mask
                const g_masks = doc.querySelector('g.masks');
                if (g_masks) {
                    const _masks = g_masks.querySelectorAll('rect');
                    masks = Array.from(_masks).map(rect => {
                        return {
                            x: Number(rect.getAttribute('x')),
                            y: Number(rect.getAttribute('y')),
                            width: Number(rect.getAttribute('width')),
                            height: Number(rect.getAttribute('height')),
                            id: gen_id()
                        };
                    });
                }

                let texts: LabelText[] = [];

                // LabelText
                const g_text_layer = doc.querySelector('g.texts');
                if (g_text_layer) {
                    const boxes = Array.from(g_text_layer.querySelectorAll('g.text_box'));
                    const _texts_old = Array.from(g_text_layer.querySelectorAll('text.label_text'));

                    if (boxes.length > 0) {
                        texts = boxes.map((box) => {
                            const _texts = Array.from(box.querySelectorAll('text.main'));
                            if (_texts.length > 0) {
                                const x = Number(_texts[0].getAttribute('x'));
                                const y = Number(_texts[0].getAttribute('y'));
                                const id = gen_id();
                                const text_joined = _texts.map((t) => {
                                    return t.innerHTML
                                }).join('\\n');
                                return {
                                    x,
                                    y,
                                    id,
                                    text: text_joined
                                };
                            }
                        }).filter(Boolean);
                    } else {
                        // 改行テキスト対応以前
                        if (_texts_old.length > 0) {
                            const _texts = g_text_layer.querySelectorAll('text.label_text');
                            texts = Array.from(_texts).map(text => {
                                const label_text: LabelText = {
                                    x: Number(text.getAttribute('x')),
                                    y: Number(text.getAttribute('y')),
                                    text: text.innerHTML,
                                    id: gen_id()
                                };
                                return label_text;
                            });
                        }
                    }
                }

                let circles: MyCircle[] = [];

                // Circle
                const g_circles = doc.querySelector('g.circles');
                if (g_circles) {
                    const _circles = g_circles.querySelectorAll('circle');

                    circles = Array.from(_circles).map(circle => {
                        return {
                            cx: Number(circle.getAttribute('cx')),
                            cy: Number(circle.getAttribute('cy')),
                            r: Number(circle.getAttribute('r')),
                            id: gen_id()
                        };
                    });
                }

                let ellipses: MyEllipse[] = [];

                // Ellipse
                const g_ellipses = doc.querySelector('g.ellipses');
                if (g_ellipses) {
                    const _ellipses = g_ellipses.querySelectorAll('ellipse');
                    ellipses = Array.from(_ellipses).map(ellipse => {
                        return {
                            cx: Number(ellipse.getAttribute('cx')),
                            cy: Number(ellipse.getAttribute('cy')),
                            rx: Number(ellipse.getAttribute('rx')),
                            ry: Number(ellipse.getAttribute('ry')),
                            id: gen_id()
                        };
                    });
                }

                let lines: MyLine[] = [];

                // Lines
                const g_lines = doc.querySelector('g.lines');
                if (g_lines) {
                    const _lines = g_lines.querySelectorAll('line');
                    lines = Array.from(_lines).map((line: SVGLineElement) => {
                        const has_start_marker = !!line.style["marker-start"];
                        const has_end_marker = !!line.style["marker-end"];

                        const arrow: ArrowDirection = (has_start_marker && has_end_marker) ? 'both' : (has_start_marker ? 'forward' : 'none');

                        return {
                            x1: Number(line.getAttribute('x1')),
                            y1: Number(line.getAttribute('y1')),
                            x2: Number(line.getAttribute('x2')),
                            y2: Number(line.getAttribute('y2')),
                            arrow,
                            id: gen_id()
                        };
                    });
                }

                const filename = file.name;

                next({
                    image,
                    rects,
                    masks,
                    texts,
                    circles,
                    ellipses,
                    lines,
                    filename
                });
            } else {
                const do_convert = confirm("指定された画像ファイルはこのアプリで保存されたものではないようです。ビットマップとして解釈して編集を始めますか？");
                if (do_convert) {
                    const $img: HTMLImageElement = new Image();

                    $img.onload = function () {
                        const canvas: HTMLCanvasElement = document.createElement('canvas');
                        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

                        canvas.width = $img.width;
                        canvas.height = $img.height;

                        ctx.drawImage($img, 0, 0);
                        const dataUrl = canvas.toDataURL();

                        next({
                            image: {
                                dataUrl,
                                width: $img.width,
                                height: $img.height,
                                id: gen_id()
                            },
                            rects: [],
                            masks: [],
                            texts: [],
                            circles: [],
                            ellipses: [],
                            lines: [],
                            filename: file.name
                        });
                    };

                    $img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`;
                }
            }
        };

        const reader: FileReader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const fileContent = event.target.result as string;

            parseSvgContent(fileContent);
        };
        reader.readAsText(file);
    };

    const parse_binary_image = (file: File, next: (data: Omit<ApplicationImage, "rects" | "masks" | "circles" | "ellipses" | "texts" | "lines">) => void, gen_id: () => number) => {
        const parseImageContent = (dataUrl: string) => {
            const $img: HTMLImageElement = new Image();
            $img.onload = () => {
                let image: ImageAndDimensions = {
                    dataUrl,
                    width: $img.width,
                    height: $img.height,
                    id: gen_id()
                };

                const filename = file.name.replace(/\.(png|jpg|bmp)$/, '.svg');

                next({
                    image,
                    filename
                });
            }
            $img.src = dataUrl;
        };

        const reader: FileReader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const fileContent = event.target.result as string;

            parseImageContent(fileContent);
        };
        reader.readAsDataURL(file);
    };

    const utoa = (str: string) => {
        return window.btoa(unescape(encodeURIComponent(str)));
    };

    const rasterize = async (element_id: string, width: number, height: number) => {
        return new Promise<Blob>((resolve: (value: Blob) => void) => {
            const $svg = document.querySelector(element_id)! as SVGElement;
            const $img: HTMLImageElement = new Image();
            const xml = new XMLSerializer().serializeToString($svg);
            const b64Start: string = "data:image/svg+xml;base64,";

            const image64 = b64Start + utoa(xml);
            // const image64 = b64Start + base64EncodeUnicode(xml);

            $img.onload = () => {
                const sx = 0;
                // const sx = crop.start.x;
                const sy = 0;
                // const sy = crop.start.y;
                const sw = width;
                // const sw = crop.end.x - crop.start.x;
                const sh = height;
                // const sh = crop.end.y - crop.start.y;
                const dx = 0;
                const dy = 0;
                const dw = sw;
                const dh = sh;

                const canvas: HTMLCanvasElement = document.createElement('canvas');
                // const canvas: HTMLCanvasElement = document.getElementById("canvas")! as HTMLCanvasElement;
                canvas.width = dw;
                canvas.height = dh;
                const ctx = canvas.getContext!("2d")!;

                // ctx.fillStyle = 'black';
                // ctx.fillRect(0, 0, dw, dh);
                ctx.drawImage($img, sx, sy, sw, sh, dx, dy, dw, dh);
                // state.show_canvas = true;
                // const source: string = canvas.toDataURL('image/png');
                canvas.toBlob(blob => {
                    resolve(blob);
                }, 'image/png');
            }
            $img.src = image64;
        });
    };

    return {
        parse_my_svg,
        parse_binary_image,
        generate_svg_text_to_save,
        rasterize
    };
};