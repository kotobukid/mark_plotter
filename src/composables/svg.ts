import {nextTick} from "vue";

export const useSVG = () => {
    const generate_svg_text_to_save = async ($svg_original: HTMLElement): Promise<string> => {
        return new Promise((resolve => {
            const $svg = $svg_original.cloneNode(true) as HTMLElement;

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
            resolve(`<?xml version="1.0" encoding="utf-8" ?>
${text}`);
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

    return {
        generate_svg_text_to_save
    };
};