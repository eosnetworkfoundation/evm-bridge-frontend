import { createApp, reactive } from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue-next'
import i18n from './i18n'

import { plugin as alertPlugin } from './plugins/alert'
import Fa from './components/FontAwesomeIcon.vue'

import './index.scss'
import './assets/fontawesome/css/all.css'

const app = createApp(App)

app.use(BootstrapVue)
app.use(i18n)
app.use(router)
app.use(alertPlugin)

const wallet = reactive({
    connected: false,
    connecting: false,
    connect: null
  })
app.provide('wallet', wallet)


app.component('Fa', Fa)
app.provide('env', location.host === 'bridge.evm.eosnetwork.com' ? 'MAINNET' : 'TESTNET')
app.provide('i18n', i18n)

app.mount('#app')
