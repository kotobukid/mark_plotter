import {defineStore} from "pinia";
import {LabelText, Point2D} from "../types.ts";

export const useTextStore = defineStore('text', {
    state() {
        return {
            texts: [] as LabelText[],
            show_option: false,
            locate_to_create: {x: 0, y: 0},
            edit_target: -1,
            buffer: ''
        };
    },
    actions: {
        create(lt: LabelText) {
            this.texts.push(lt);
        },
        update_text(text: string) {
            if (this.edit_target !== -1) {
                const texts: LabelText[] = this.texts;
                let found: boolean = false;
                for (let i = 0; i < texts.length; i++) {
                    if (texts[i].id === this.edit_target) {
                        texts[i] = {
                            ...texts[i],
                            text
                        };
                        found = true;
                        break;
                    }

                }
                if (found) {
                    this.texts = texts;
                }
            }
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
        set_locate_to_create(pos: Point2D) {
            this.locate_to_create = {...pos};
        },
        set_edit_target(id: number) {
            this.edit_target = id;
        },
        set_buffer(text: string) {
            this.buffer = text;
        }
    },
    getters: {}
});