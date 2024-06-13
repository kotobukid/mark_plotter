import {defineStore} from 'pinia'

type PointXY = {
    x: number,
    y: number
};

export const useCropStore = defineStore('crop', {
    state: () => {
        return {
            start: {
                x: 0,
                y: 0,
            },
            end: {
                x: 0,
                y: 0,
            },
            show_preview: false
        }
    },
    actions: {
        set_start(p: PointXY) {
            this.start = p;
        },
        set_end(p: PointXY) {
            this.end = p;
        },
        reset() {
            this.start = {x: 0, y: 0};
            this.end = {x: 0, y: 0};
            this.show_preview = false;
        },
        commit() {
            this.show_preview = false;

            const {start, end} = this;

            const s_gte_x: boolean = start.x - end.x > 0;
            const s_gte_y: boolean = start.y - end.y > 0;

            const width = (start.x - end.x) * (s_gte_x ? 1 : -1);
            const height = (start.y - end.y) * (s_gte_y ? 1 : -1);
            const x = s_gte_x ? end.x : start.x;
            const y = s_gte_y ? end.y : start.y;

            this.start = {
                x: 0,
                y: 0
            };

            this.end = {
                x: width,
                y: height
            };

            return {
                id: -1,
                x,
                y,
                width,
                height,
            };
        }
    },
    getters: {
        rect_preview() {
            const start = this.start;
            const end = this.end;
            const s_gte_x: boolean = start.x - end.x > 0;
            const s_gte_y: boolean = start.y - end.y > 0;

            const width = (start.x - end.x) * (s_gte_x ? 1 : -1);
            const height = (start.y - end.y) * (s_gte_y ? 1 : -1);
            const x = s_gte_x ? end.x : start.x;
            const y = s_gte_y ? end.y : start.y;

            return {
                x, y, width, height
            };
        }
    },
});