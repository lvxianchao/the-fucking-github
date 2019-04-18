import Base from 'lowdb/adapters/Base'
import chromep from 'chrome-promise'
import {isEmpty} from 'lodash'

class ChromeStorage extends Base {
    async read() {
        let result = await chromep.storage.local.get(this.source);

        if (!isEmpty(result[this.source])) {
            return result[this.source];
        } else {
            return await chromep.storage.local.set({
                [this.source]: this.defaultValue
            }).then(() => {
                return this.defaultValue;
            })
        }

    }

    async write(data) {
        return await chromep.storage.local.set({
            [this.source]: data
        })
    }

}

export default ChromeStorage;