const useHistoryManager = () => {
    const {gen_id} = (() => {
        let id: number = 0;
        return {
            gen_id: (): number => {
                id = id + 1;
                return id;
            }
        };
    })();

    return {
        gen_id
    };
};


export {useHistoryManager};