import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './components/App';
import Storage from './Storage';
import _ from 'lodash';
import shortid from 'shortid';
import '../css/clipboard.css';
import $ from 'jquery';
import ClipboardJS from 'clipboard';
import VueClipboard from 'vue-clipboard2';

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
Vue.use(VueClipboard);

window.app = new Vue({
    el: '#app',
    render: h => h(App)
});

$(function () {
    const clipboard = new ClipboardJS('i.copy-icon', {
        target: trigger => {
            return trigger.parentNode.querySelector('pre');
        }
    });

    clipboard.on('success', e => {
        e.trigger.parentNode.lastChild.textContent = 'Copied to clipboard success';
        e.clearSelection();
    });

    $(document).on('mouseout', 'i.copy-icon', function (e) {
        $(e.target).next('span.copy-tips').text('Copy to clipboard');
    });
});