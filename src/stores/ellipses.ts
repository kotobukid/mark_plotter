import {defineStore} from "pinia";
import {MyEllipse} from "../types.ts";

export const useEllipseStore = defineStore('ellipse', {
    state() {
        return {
            ellipses: [] as MyEllipse[]
        }
    },
    actions: {
        create(e: MyEllipse) {
            this.ellipses.push(e);
        },
        replace(ellipses: MyEllipse[]) {
            this.ellipses = ellipses;
        },
        erase(id: number) {
            this.ellipses = this.ellipses.filter(el => el.id !== id);
        }
    }
});