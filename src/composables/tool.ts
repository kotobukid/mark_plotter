import {useToolStore} from "../stores/tool.ts";
import {computed} from "vue";

export const useTool = () => {
    const tool_store = useToolStore();

    const set_tool = tool_store.set;
    const current_tool = computed(() => tool_store.current);

    const set_circle_tool = tool_store.set_circle_tool;
    const circle_option = computed(() => tool_store.circle_tool_option);

    return {
        set_tool,
        current_tool,
        circle_option,
        set_circle_tool
    };
};