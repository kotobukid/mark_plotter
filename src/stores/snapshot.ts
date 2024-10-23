import {defineStore} from "pinia";
import type {LabelText, MyCircle, MyEllipse, MyLine, MyRect, Mask, Snapshot} from "../types.ts";

export const useSnapshotStore = defineStore('snapshot', {
    state() {
        return {
            snapshots: [] as Snapshot[]
        }
    },
    actions: {
        wipe() {
            this.snapshots = [];
        },
        commit(image_changed: number | -1,
               circles: MyCircle[],
               rects: MyRect[],
               masks: Mask[],
               ellipses: MyEllipse[],
               lines: MyLine[],
               texts: LabelText[],
        ) {
            const ss: Snapshot = {
                circles: [...circles],
                rects: [...rects],
                masks: [...masks],
                ellipses: [...ellipses],
                lines: [...lines],
                texts: [...texts],
                image_index: image_changed
            };
            this.snapshots.push(ss);
        },
        pop_last(): Snapshot | undefined {
            const lastSnapshot = this.snapshots.pop();
            if (lastSnapshot) {
                return lastSnapshot;
            } else {
                return undefined;
            }
        }
    }
})