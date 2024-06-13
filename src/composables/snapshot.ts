import {useSnapshotStore} from "../stores/snapshot.ts";
import {useCircleStore} from "../stores/circles.ts";
import {useRectStore} from "../stores/rects.ts";
import {useEllipseStore} from "../stores/ellipses.ts";
import {useTextStore} from "../stores/texts.ts";
import {useLineStore} from "../stores/lines.ts";
import {computed} from "vue";
import {Snapshot} from "../types.ts";
import {useImageStore} from "../stores/images.ts";

export const useSnapshot = () => {
    const snapshot_store = useSnapshotStore();
    const circle_store = useCircleStore();
    const rect_store = useRectStore();
    const ellipse_store = useEllipseStore();
    const text_store = useTextStore();
    const line_store = useLineStore();
    const image_store = useImageStore();

    const commit = (image_index: number) => {
        snapshot_store.commit(image_index,
            circle_store.circles,
            rect_store.rects,
            ellipse_store.ellipses,
            line_store.lines,
            text_store.texts
        );
    };

    const undo_available = computed(() => snapshot_store.snapshots.length > 0);

    const pop_last = () => {
        const ss: Snapshot | undefined = snapshot_store.pop_last();
        if (ss) {
            circle_store.replace(ss.circles);
            rect_store.replace(ss.rects);
            ellipse_store.replace(ss.ellipses);
            line_store.replace(ss.lines);
            text_store.replace(ss.texts);
            if (ss.image_index) {
                // image_store.replace(ss)
            }
        }
    };

    const wipe = () => {
        snapshot_store.wipe();

        circle_store.replace([]);
        rect_store.replace([]);
        ellipse_store.replace([]);
        line_store.replace([]);
        text_store.replace([]);
        // image_store.replace({
        //     dataUrl: '',
        //     width: 0,
        //     height: 0,
        //     id: 0
        // });
        commit(-1);
    }

    return {
        commit,
        wipe,
        pop_last,
        undo_available
    };
};