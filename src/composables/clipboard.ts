import {useDataUrl} from "./dataUrl.ts";
import {ImageAndDimensions} from "../types.ts";
import {useToolStore} from "../stores/tool.ts";
import {useImageStore} from "../stores/images.ts";
import {useSnapshot} from "./snapshot.ts";
import {useImage} from "./image.ts";

type DataUrl = string;

const {
    blobToDataURL,
    getDataUrlAndDimensions
} = useDataUrl();

const getClipboardImage = async (): Promise<Blob> => {
    return new Promise<Blob>(async (resolve, reject) => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            let found: boolean = false;
            for (const clipboardItem of clipboardItems) {
                if (clipboardItem.types.includes('image/png')) {
                    found = true;
                    return resolve(await clipboardItem.getType('image/png'));
                }
            }
            if (!found) {
                reject();
            }
        } catch (err) {
            reject();
        }
    });
};

const current_timestamp = () => {
    const now = new Date();

    return `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
};

const useClipBoard = (gen_id: () => number) => {
    const tool_store = useToolStore();
    const image_store = useImageStore();
    const {commit, wipe} = useSnapshot();
    const {image_map_manager} = useImage();

    const capture_clipboard = (): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            tool_store.set('');

            try {
                const _data: ImageAndDimensions = await getDataUrlFromClipboard();

                image_store.replace(_data);

                const filename = `clipboard_${current_timestamp()}.svg`;
                wipe();

                const image_cloned: ImageAndDimensions = {
                    ..._data,
                    id: gen_id()
                };

                let new_image_index: number = image_map_manager.push(image_cloned);
                commit(new_image_index);
                resolve(filename);
            } catch {
                reject();
            }
        });
    };

    return {
        capture_clipboard,
    };
};

const getDataUrlFromClipboard = async (): Promise<ImageAndDimensions> => {
    return new Promise(async (resolve, reject) => {
        try {
            const blob: Blob = await getClipboardImage();
            const image: DataUrl = await blobToDataURL(blob);
            return resolve(await getDataUrlAndDimensions(image));
        } catch {
            reject();
        }
    })

};

export {useClipBoard}