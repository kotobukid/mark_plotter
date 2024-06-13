import {ImageAndDimensions} from "../types.ts";

const useDataUrl = () => {
    const blobToDataURL = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!blob) {
                reject();
            } else {
                const reader: FileReader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            }
        });
    }

    const getDataUrlDimensions = (dataUrl: string): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img: HTMLImageElement = new Image();
            img.onload = () => {
                resolve({width: img.width, height: img.height});
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    };

    const getDataUrlAndDimensions = (dataUrl: string, gen_id?: () => number): Promise<ImageAndDimensions> => {
        return new Promise((resolve, reject) => {
            const img: HTMLImageElement = new Image();
            img.onload = () => {
                resolve({
                    dataUrl: dataUrl,
                    width: img.width,
                    height: img.height,
                    id: gen_id ? gen_id() : -1
                });
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    };


    return {
        blobToDataURL,
        getDataUrlAndDimensions,
        getDataUrlDimensions
    };
};

export {
    useDataUrl
};