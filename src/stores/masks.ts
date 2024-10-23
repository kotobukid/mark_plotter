import {defineStore} from 'pinia'
import {Mask} from "../types.ts";

export const useMaskStore = defineStore('mask', {
    state() {
        return {
            masks: [] as Mask[]
        };
    },
    actions: {
        create(m: Mask) {
            this.masks.push(m);
        },
        replace(masks: Mask[]) {
            this.masks = masks;
        },
        erase (id: number) {
            this.masks = this.masks.filter(el => el.id !== id);
        }
    }
})