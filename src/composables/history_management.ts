import {computed, ref} from "vue";
import type {Snapshot} from "../types.ts";

const useHistoryManager = () => {
    const snapshots = ref<Snapshot[]>([] as Snapshot[]);


    const commit_snapshot = (ss: Snapshot) => {
        // const ss: Snapshot = {
        //     circles: [...circles.value],
        //     rects: [...rects.value],
        //     ellipses: [...ellipses.value],
        //     lines: [...lines.value],
        //     texts: [...texts.value],
        //     image_index: image_changed
        // };

        // image_map_manager.dump();

        snapshots.value = [...snapshots.value, ss];
    };


    const pop_last_snapshot = (): Snapshot => {
        const ss = snapshots.value.pop();
        return ss;
    };

    const wipe_snapshots = () => {
        snapshots.value = [];
    };

    const {gen_id} = (() => {
        let id: number = 0;
        return {
            gen_id: (): number => {
                id = id + 1;
                return id;
            }
        };
    })();

    const undo_enabled = computed(() => {
        return snapshots.value.length > 0;
    });

    return {
        gen_id,
        commit_snapshot,
        wipe_snapshots,
        pop_last_snapshot,
        undo_enabled
    };
};


export {useHistoryManager};