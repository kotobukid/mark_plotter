import {computed, ref, type Ref} from "vue";
import {useSVG} from "./svg.ts";
import type {ImageAndDimensions} from "../types.ts";
import {useCircleStore} from "../stores/circles.ts";
import {useImageStore} from "../stores/images.ts";
import {useRectStore} from "../stores/rects.ts";
import {useEllipseStore} from "../stores/ellipses.ts";
import {useLineStore} from "../stores/lines.ts";
import {useTextStore} from "../stores/texts.ts";
import {useImage} from "./image.ts";
import {useSnapshot} from "./snapshot.ts";

interface Window {
    showOpenFilePicker: any,
    showSaveFilePicker: any
}

declare var window: Window;

const {
    parse_my_svg,
    parse_binary_image,
    generate_svg_text_to_save
} = useSVG();

export const useFileSystem = (gen_id: () => number) => {
    const image_store = useImageStore();
    const circle_store = useCircleStore();
    const rect_store = useRectStore();
    const ellipse_store = useEllipseStore();
    const line_store = useLineStore();
    const text_store = useTextStore();
    const {push_image} = useImage();
    const {commit} = useSnapshot();

    const target_file: Ref<FileSystemFileHandle> = ref(null);
    const target_files: Ref<FileSystemFileHandle[]> = ref([]);
    const writable_handle = ref<FileSystemWritableFileStream>(null);
    const filename = ref('');
    const original_filename = ref('');

    const overwrite_available = computed(() => {
        if (target_file.value && target_file.value.name) {
            return target_file.value.name.endsWith('.svg');
        } else {
            return false;
        }
    });

    const handle_file_change = (file: File) => {
        if (file) {
            const readFileContent = (file) => {
                if (file.type === 'image/svg+xml') {
                    parse_my_svg(file, (result) => {
                        image_store.replace(result.image);
                        rect_store.replace(result.rects);
                        text_store.replace(result.texts);
                        circle_store.replace(result.circles);
                        ellipse_store.replace(result.ellipses);
                        line_store.replace(result.lines);
                        filename.value = result.filename;
                        document.title = filename.value;
                        original_filename.value = file.name;

                        const image_cloned: ImageAndDimensions = {
                            width: result.image.width,
                            height: result.image.height,
                            dataUrl: result.image.dataUrl,
                            id: gen_id()
                        };

                        let new_image_index: number = push_image(image_cloned);
                        commit(new_image_index);
                    }, gen_id);
                } else if (['image/png', 'image/jpg', 'image/jpeg', 'image/bmp'].includes(file.type)) {
                    parse_binary_image(file, (result) => {
                        image_store.replace(result.image);
                        rect_store.replace([]);
                        text_store.replace([]);
                        circle_store.replace([]);
                        ellipse_store.replace([]);
                        line_store.replace([]);
                        filename.value = result.filename;
                        document.title = filename.value;
                        original_filename.value = file.name;

                        const image_cloned: ImageAndDimensions = {
                            width: result.image.width,
                            height: result.image.height,
                            dataUrl: result.image.dataUrl,
                            id: gen_id()
                        };

                        let new_image_index: number = push_image(image_cloned);
                        commit(new_image_index);
                    }, gen_id);
                }
            };

            readFileContent(file);
        }
    };
    const open_file_from_list = async (f: FileSystemFileHandle) => {
        const file = await f.getFile();
        target_file.value = f;
        handle_file_change(file);
    };

    const read_file = async (fileHandle: FileSystemFileHandle) => {
        const file = await fileHandle.getFile();
        target_file.value = fileHandle;
        filename.value = file.name;

        handle_file_change(file);
    };

    const open_file_dialog = async () => {
        if (window.showOpenFilePicker) {
            const options = {
                types: [
                    {
                        description: 'Images',
                        accept: {
                            'image/*': ['.svg', '.png', '.jpg'],
                        },
                    },
                ],
                excludeAcceptAllOption: true,
                multiple: true
            };

            const fileSystemFileHandles: FileSystemFileHandle[] = await window.showOpenFilePicker!(options);
            target_files.value = fileSystemFileHandles;

            await read_file(fileSystemFileHandles[0]);
        } else {
            alert('FileSystemAPIに対応したブラウザを使用してください');
        }
    };

    const save_as = async (suggestedName: string) => {
        const $svg_original = document.getElementById("svg_main").cloneNode(true) as HTMLElement;

        const file_content: string = await generate_svg_text_to_save($svg_original);

        const option = {
            types: [
                {
                    description: "SVGファイル",
                    accept: {"image/svg+xml": [".svg"]},
                },
            ],
            suggestedName
        };

        const fileHandle = await window.showSaveFilePicker(option);
        const writable = await fileHandle.createWritable();
        await writable.write(file_content);
        await writable.close();
    };

    const overwrite_file = async () => {
        if (overwrite_available.value) {
            const $svg_original = document.getElementById("svg_main").cloneNode(true) as HTMLElement;

            writable_handle.value = await target_file.value.createWritable();
            const file_content: string = await generate_svg_text_to_save($svg_original);
            await writable_handle.value.write(file_content);
            await writable_handle.value.close();
        }
    };

    return {
        target_file,
        target_files,
        filename,
        original_filename,
        writable_handle,
        overwrite_available,
        open_file_from_list,
        overwrite_file,
        open_file_dialog,
        save_as
    };
};