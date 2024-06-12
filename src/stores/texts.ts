import {defineStore} from "pinia";
import {LabelText} from "../types.ts";

export const useTextStore = defineStore('text', {
    state() {
        return {
            texts: [] as LabelText[]
        };
    },
    actions: {
        create(ls: LabelText) {
            this.texts.push(ls);
        },
        replace(label_texts: LabelText[]) {
            this.texts = label_texts;
        },
        erase(id: number) {
            this.texts = this.texts.filter(lt => lt.id !== id);
        }
    }
});