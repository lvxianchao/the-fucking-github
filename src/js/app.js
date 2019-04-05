import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './components/App';
import Storage from './Storage';
import _ from 'lodash';
import shortid from 'shortid';

window._ = _;
window.db = Storage.db;
window.shortid = shortid;

db.defaults({
    token: window.localStorage.getItem('token'),
    tags: [],
    repositories: [],
    tagsAndRepositories: [],
    tagStatus: [
        {
            value: 'all',
            label: 'All Repositories',
        },
        {
            value: 'untagged',
            label: 'Untagged Repositories',
        },
        {
            value: 'tagged',
            label: 'Tagged Repositories',
        }
    ],
}).write();

Vue.use(ElementUI);

window.app = new Vue({
    el: '#app',
    render: h => h(App)
});