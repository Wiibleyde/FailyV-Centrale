let cooldown = 0;

module.exports = {
    get: () => {
        return cooldown;
    },
    start: () => {
        cooldown = 3;
    },
    init: () => {
        setInterval(() => {
            if(cooldown != 0) {
                cooldown--;
            }
        }, 1000);
    }
}
