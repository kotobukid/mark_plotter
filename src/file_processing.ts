import type {MyCircle, MyEllipse, ImageAndDimensions, LabelText, MyLine, MyRect} from "./types.ts";

export const parse_my_svg = (file: File, next: Function) => {
    const parseSvgContent = (content) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "image/svg+xml");
        const elements = doc.querySelectorAll('image.main_image');

        let is_my_svg: boolean = elements.length === 1;

        if (is_my_svg) {

            let image: ImageAndDimensions = {
                dataUrl: '',
                width: 0,
                height: 0
            };

            elements.forEach(element => {
                const href = element.getAttribute('href');
                const dataUrl = href ? href : element.getAttribute('xlink:href');
                const width = Number(element.getAttribute('width'));
                const height = Number(element.getAttribute('height'));

                image = {
                    dataUrl,
                    width,
                    height
                };
            });

            let rects: MyRect[] = [];

            // Rect
            const g_rects = doc.querySelector('g.rects'); // 必要に応じてクラス名を変更するにゃ
            if (g_rects) {
                const _rects = g_rects.querySelectorAll('rect');
                rects = Array.from(_rects).map(rect => {
                    return {
                        x: Number(rect.getAttribute('x')),
                        y: Number(rect.getAttribute('y')),
                        width: Number(rect.getAttribute('width')),
                        height: Number(rect.getAttribute('height'))
                    };
                });
            }

            let texts: LabelText[] = [];

            // LabelText
            const g_texts = doc.querySelector('g.texts'); // 必要に応じてクラス名を変更するにゃ
            if (g_texts) {
                const _texts = g_texts.querySelectorAll('text.label_text');
                texts = Array.from(_texts).map(text => {
                    const label_text: LabelText = {
                        x: Number(text.getAttribute('x')),
                        y: Number(text.getAttribute('y')),
                        text: text.innerHTML,
                    };
                    return label_text;
                });
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
                    };
                });
            }

            let lines: MyLine[] = [];

            // Lines
            const g_lines = doc.querySelector('g.lines');
            if (g_lines) {
                const _lines = g_lines.querySelectorAll('line');
                lines = Array.from(_lines).map(line => {
                    return {
                        x1: Number(line.getAttribute('x1')),
                        y1: Number(line.getAttribute('y1')),
                        x2: Number(line.getAttribute('x2')),
                        y2: Number(line.getAttribute('y2')),
                    };
                });
            }

            const filename = file.name;

            next({
                image,
                rects,
                texts,
                circles,
                ellipses,
                lines,
                filename
            });
        } else {
            const do_convert = confirm("指定された画像ファイルはこのアプリで保存されたものではないようです。ビットマップとして解釈して編集を始めますか？");
            if (do_convert) {
                const $img = new Image();

                $img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = $img.width;
                    canvas.height = $img.height;

                    ctx.drawImage($img, 0, 0);
                    const dataUrl = canvas.toDataURL();

                    next({
                        image: {
                            dataUrl,
                            width: $img.width,
                            height: $img.height
                        },
                        rects: [],
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

    const reader = new FileReader();
    reader.onload = (event) => {
        const fileContent = event.target.result;

        parseSvgContent(fileContent);
    };
    reader.readAsText(file);
};

export const parse_binary_image = (file: File, next: Function) => {
    const parseImageContent = (dataUrl: string) => {
        const $img = new Image();
        $img.onload = () => {
            let image: ImageAndDimensions = {
                dataUrl,
                width: $img.width,
                height: $img.height
            };

            const filename = file.name.replace(/\.(png|jpg|bmp)$/, '.svg');

            next({
                image,
                filename
            });
        }
        $img.src = dataUrl;
    };

    const reader = new FileReader();
    reader.onload = (event) => {
        const fileContent = event.target.result as string;

        parseImageContent(fileContent);
    };
    reader.readAsDataURL(file);
};
