import low from 'lowdb';
import LocalStorage from 'lowdb/adapters/LocalStorage';

class Storage {
    db() {
        return low(new LocalStorage('TheFuckingGithub'));
    }
}

const storage = new Storage();

export default {
    db: storage.db()
}