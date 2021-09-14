/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2020/12/27
 * Time: 21:58
 *
 */
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Vue from 'vue';
import * as lib from '../lib';
import App from './app';
import './index.less';

document.body.innerHTML = '<div id="app"></div>';

console.log(lib);
Vue.use(ElementUI);
new Vue({
  render: h => h(App),
}).$mount('#app');
