import {defineStore} from "pinia";
import type {MyCircle} from "../types.ts";

export const useCircleStore = defineStore('circle', {
    state() {
        return {
            circles: [] as MyCircle[]
        }
    },
    actions: {
        replace(circles: MyCircle[]) {
            this.circles = circles;
        },
        create(c: MyCircle) {
            this.circles.push(c);
        },
        erase(id: number) {
            this.circles = this.circles.filter(el => el.id !== id);
        }
    }
});