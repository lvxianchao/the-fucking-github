class Storage {
    set(key, val, cb) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {
            const msg = 'The-Fucking-Github cannot save data. It could be the local storage is full, please clean it up and try again.';

            console.error(msg, e);
        }

        if (cb) {
            cb();
        }
    }

    get(key, cb) {
        function parse(val) {
            try {
                return JSON.parse(val);
            } catch (e) {
                return val;
            }
        }

        let val = parse(localStorage.getItem(key));

        if (cb) {
            cb(val)
        } else {
            return val;
        }
    }
}

export default {store: new Storage()}