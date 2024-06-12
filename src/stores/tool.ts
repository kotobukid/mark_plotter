import {defineStore} from "pinia";
import {Tool} from "../types.ts";

export const useToolStore = defineStore('tool', {
    state() {
        return {
            current: '' as Tool
        }
    },
    actions: {
        set(tool: Tool) {
            this.current = tool;
        }
    }
});