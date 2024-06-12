import {defineStore} from "pinia";
import type {ImageAndDimensions} from "../types.ts";

export const useImageStore = defineStore('image', {
    state() {
        return {
            image: {
                dataUrl: '',
                width: 0,
                height: 0,
                id: 0
            } as ImageAndDimensions
        }
    },
    actions: {
        replace(image: ImageAndDimensions) {
            this.image = image;
        }
    }
});