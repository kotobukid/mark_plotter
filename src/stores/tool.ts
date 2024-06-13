import {defineStore} from "pinia";
import {Tool} from "../types.ts";

type CircleToolOption = 'draw_full' | 'draw_half';

export const useToolStore = defineStore('tool', {
    state() {
        return {
            current: '' as Tool,
            circle_tool_option: 'draw_full'
        }
    },
    actions: {
        set(tool: Tool) {
            this.current = tool;
        },
        set_circle_tool(option: CircleToolOption) {
            this.circle_tool_option = option;
        }
    }
});