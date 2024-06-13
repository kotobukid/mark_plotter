import type {ImageAndDimensions} from "../types.ts";
import {useImageStore} from "../stores/images.ts";

export const useImage = () => {
    const image_store = useImageStore();

    const push_image = image_store.push;

    const get_image = image_store.get;

    const get_current_image_index = () => {
        return image_store.index;
    };

    const wipe_image = (): void => {
        image_store.wipe();
    };

    return {
        get_image,
        push_image,
        wipe_image,
        get_current_image_index
    };
};