import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './components/App';
import _ from 'lodash';
import shortid from 'shortid';
import '../css/clipboard.css';
import $ from 'jquery';
import ClipboardJS from 'clipboard';
import VueClipboard from 'vue-clipboard2';
import VueLazyload from 'vue-lazyload';

import low from 'lowdb';
import ChromeStorage from './utils/ChromeStorage';

low(new ChromeStorage('TheFuckingGithub')).then(db => {
    chrome.storage.sync.get(items => {
        db.defaults({
            token: items.token,
            tags: items.tags ? items.tags : [],
            repositories: [],
            tagsAndRepositories: items.tagsAndRepositories ? items.tagsAndRepositories : [],
        }).write();

        window.db = db;
        window.shortid = shortid;
        window._ = _;

        Vue.use(ElementUI);
        Vue.use(VueClipboard);
        Vue.use(VueLazyload, {
            loading: chrome.extension.getURL('icons/loading.gif'),
            dispatchEvent: true,
            lazyComponent: true,
        });

        window.app = new Vue({
            el: '#app',
            render: h => h(App)
        });
    });
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