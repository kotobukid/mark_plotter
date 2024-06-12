import {defineStore} from 'pinia'
import {MyRect} from "../types.ts";

export const useRectStore = defineStore('rect', {
    state() {
        return {
            rects: [] as MyRect[]
        };
    },
    actions: {
        create(r: MyRect) {
            this.rects.push(r);
        },
        replace(rects: MyRect[]) {
            this.rects = rects;
        },
        erase (id: number) {
            this.rects = this.rects.filter(el => el.id !== id);
        }
    }
})