import {defineStore} from "pinia";
import {MyLine} from "../types.ts";

export const useLineStore = defineStore('line', {
    state() {
        return {
            lines: [] as MyLine[]
        }
    },
    actions: {
        create(l: MyLine) {
            this.lines.push(l);
        },
        replace(lines: MyLine[]) {
            this.lines = lines;
        },
        erase(id: number) {
            this.lines = this.lines.filter(line => line.id !== id);
        }
    }
});