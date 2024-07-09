import {useToolStore} from "../stores/tool.ts";
import {computed} from "vue";

export const useTool = () => {
    const tool_store = useToolStore();

    const set_tool = tool_store.set;
    const override = tool_store.override;
    const current_tool = computed(() => tool_store.active_tool_overridden);

    const set_circle_tool = tool_store.set_circle_tool;
    const set_arrow_direction = tool_store.set_arrow_direction;
    const circle_option = computed(() => tool_store.circle_tool_option);

    return {
        set_tool,
        override,
        current_tool,
        circle_option,
        set_circle_tool,
        set_arrow_direction
    };
};