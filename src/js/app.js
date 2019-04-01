import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './components/App';
import Storage from './Storage';

window.store = Storage.store;

Vue.use(ElementUI);

const app = new Vue({
    el: '#app',
    render: h => h(App)
});