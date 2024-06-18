import {defineStore} from "pinia";
import {Tool} from "../types.ts";

type CircleToolOption = 'draw_full' | 'draw_half';

type ToolState = {
    current: Tool,
    circle_tool_option: CircleToolOption,
    tool_override: Tool
};

type ToolActions = {
    set: (tool: Tool) => void,
    set_circle_tool: (option: CircleToolOption) => void,
    override: (tool: Tool) => void,
    release_override: () => void,
};

type ToolGetters = {
    active_tool_overridden: (state: ToolState) => Tool
};

export const useToolStore = defineStore<'tool', ToolState, ToolGetters, ToolActions>('tool', {
    state() {
        return {
            current: '' as Tool,
            circle_tool_option: 'draw_full',
            tool_override: '' as Tool
        }
    },
    actions: {
        set(tool: Tool) {
            this.current = tool;
        },
        set_circle_tool(option: CircleToolOption) {
            this.circle_tool_option = option;
        },
        override(tool: Tool) {
            this.tool_override = tool;
        },
        release_override() {
            this.tool_override = '';
        },
    },
    getters: {
        active_tool_overridden(state: ToolState): Tool {
            if (state.tool_override) {
                return state.tool_override;
            } else {
                return state.current;
            }
        }
    }
});