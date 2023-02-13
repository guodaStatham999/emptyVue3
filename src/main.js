import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import 'vue-fabric/dist/vue-fabric.min.css';
import {
    Fabric
} from 'vue-fabric';

let Vue = createApp(App)
Vue.use(Fabric)
Vue.use(ElementPlus).use(store).use(router).mount('#app')
