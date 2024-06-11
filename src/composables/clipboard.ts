import {useDataUrl} from "./dataUrl.ts";
import {ImageAndDimensions} from "../types.ts";

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

const useClipBoardParser = () => {

    return {getDataUrlFromClipboard};
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

export {useClipBoardParser}