import {defineStore} from "pinia";
import {LabelText, Point2D} from "../types.ts";

export const useTextStore = defineStore('text', {
    state() {
        return {
            texts: [] as LabelText[],
            show_option: false,
            locate_to_create: {x: 0, y: 0}
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
        },
        show_tool_option() {
            this.show_option = true;
        },
        hide_tool_option() {
            this.show_option = false;
        },
        set_locate_to_create (pos: Point2D) {
            this.locate_to_create = {...pos};
        }
    }
});