import {defineStore} from "pinia";
import type {ImageAndDimensions} from "../types.ts";

type State = {
    image: ImageAndDimensions,
    index: number,
    dict: Map<number, ImageAndDimensions>
}

export const useImageStore = defineStore<'image', State, any, any>('image', {
    state() {
        return {
            image: {
                dataUrl: '',
                width: 0,
                height: 0,
                id: 0
            } as ImageAndDimensions,
            index: 0,
            dict: new Map()
        }
    },
    actions: {
        replace(image: ImageAndDimensions) {
            this.image = image;
        },
        push(image: ImageAndDimensions) {
            this.index = this.index + 1;
            this.dict.set(this.index, image);
        },
        get(image_index: number) {
            if (this.dict.has(image_index)) {
                return this.dict.get(image_index);
            } else {
                return null;
            }
        },
        wipe() {
            this.dict.clear();
            this.index = 0;
        }
    },
    getters: {
        container_style(state: State) {
            return (padding: number): string => {
                if (state.image && state.image.width) {
                    return `width: ${padding + (state.image.width || 0)}px;`;
                } else {
                    return `width: ${padding + 1000}px;`;
                }
            }
        }
    }
});