import {computed} from "vue";
import type {ImageAndDimensions} from "../types.ts";
import {useImageStore} from "../stores/images.ts";

export const useImage = () => {
    const image_store = useImageStore();

    const image = computed(() => image_store.image);

    const image_map_manager = (() => {
        const image_map = new Map<number, ImageAndDimensions>();
        let index: number = 0;

        const push = (image: ImageAndDimensions): number => {
            index = index + 1;
            image_map.set(index, image);
            return index;
        };

        const get = (_index: number): ImageAndDimensions | null => {
            if (image_map.has(_index)) {
                return image_map.get(_index);
            } else {
                return null;
            }
        };

        const wipe = (): void => {
            image_map.clear();
            index = 0;
        };

        const dump = () => {
            console.log('dump start');
            for (let key of image_map.keys()) {
                const im = image_map.get(key);
                console.log(key)
                console.log({
                    width: im.width,
                    height: im.height
                });
            }
            console.log('dump end');
        }

        return {
            image_map,
            get,
            push,
            wipe,
            dump
        };
    })();

    return {
        image,
        image_map_manager
    };
};