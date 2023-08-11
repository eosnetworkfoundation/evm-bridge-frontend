<script setup>
import { provide, reactive, ref, inject } from 'vue'
import { RouterView } from 'vue-router'

var env = location.host === 'bridge.testnet.evm.eosnetwork.com' ? 'TESTNET' : 'MAINNET'
const i18n = inject('i18n')
const wallet = reactive({
  connected: false,
  connecting: false,
  connect: null
})
provide('wallet', wallet)

const networks = {
  "Testnet": 'https://bridge.testnet.evm.eosnetwork.com',
  "Mainnet": 'https://bridge.evm.eosnetwork.com'
}
const lang = ref(i18n.global.locale.value || 'en')
const langs = {
  en: 'English',
  // ko: '한국인'
}
const selectLang = (val) => {
  lang.value = val
  i18n.global.locale.value = val
  localStorage.locale = val
}
</script>

<template>
  <header>
    <div class="container">
      <b-navbar dark toggleable="sm">
        <a class="navbar-brand" href="">
          <img v-if="env === 'TESTNET'" src="./assets/eos_evm_testnet_logo.svg" alt="" style="filter:invert(1); height: 45px;">
          <img v-else src="./assets/eos_evm_logo.svg" alt="" style="filter:invert(1); height: 45px;">
        </a>
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown class="me-3" no-caret strategy="fixed" :text="$t('home.switchNetwork')" toggle-class="text-decoration-none" >
            <b-dropdown-item :href="v" v-for="(v, k) in networks" :key="k">{{ k }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown class="me-3" no-caret strategy="fixed" toggle-class="locale">
            <template #button-content>
              <fa icon="language"/>
              {{langs[lang]}}
            </template>
            <b-dropdown-item @click="selectLang(k)" v-for="(v, k) in langs" :key="k">{{v}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <span class="address" style="line-height: 40px;" v-if="wallet.address">
            {{ wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4) }}
          </span>
          <b-nav-item class="connect-btn d-none d-sm-block" @click="wallet.connect()" v-else>
            <span v-if="wallet.connected">{{$t('home.connected')}}</span>
            <span v-else-if="wallet.connecting">{{$t('home.connecting')}}</span>
            <span v-else>{{$t('home.connectWallet')}}</span>
          </b-nav-item>
        </b-navbar-nav>
      </b-navbar>
    </div>
  </header>

  <RouterView class="main"/>

  <footer>
    <div class="container">
      <b-row class="mb-4">
        <b-col sm="7" class="text-center text-sm-start">
          <img v-if="env === 'TESTNET'" class="mb-3" src="./assets/eos_evm_testnet_logo.svg" alt="" style="filter:invert(1); height: 45px;">
          <img v-else class="mb-3" src="./assets/eos_evm_logo.svg" alt="" style="filter:invert(1); height: 45px;">
        </b-col>
        <b-col sm="2" class="text-left" style="position: relative">

          <div style="margin:auto; width: fit-content;">
            <div class="footer-info-header">{{$t('navbar.about')}}</div>
            <ul style="list-style: none; padding-left: 0;">
              <li>
                <b-link href="https://docs.eosnetwork.com/docs/latest/eos-evm/">
                  {{$t('navbar.docs')}}
                </b-link>
              </li>
              <li>
                <b-link href="https://docs.eosnetwork.com/docs/latest/eos-evm/">
                  {{$t('navbar.faq')}}
                </b-link>
              </li>
            </ul>
          </div>

        </b-col>
        <b-col sm class="text-center text-lg-end" style="font-size: 1.5em;">
          <b-link href="https://twitter.com/EosNFoundation">
            <fa icon="twitter" fab/>
          </b-link>
          <b-link href="https://discord.gg/eos-network">
            <fa icon="discord" fab/>
          </b-link>
          <b-link href="https://t.me/eosevm">
            <fa icon="telegram" fab/>
          </b-link>
          <b-link href="https://www.youtube.com/@EOSNetworkFoundation">
            <fa icon="youtube" fab/>
          </b-link>
        </b-col>
      </b-row>
      <div class="text-center text-sm-start">{{$t('footer.copyright')}}</div>
    </div>
  </footer>
</template>

<style scoped lang="scss">

.connect-btn {
  border: 1px solid #fff;
  border-radius: 10px;
  text-align: center;
}

:deep(.locale) {
  color: #fff;
}

header {
  .navbar {
    color: #fff;
  }

  .address[data-select] {
    display: inline-block;
    position: relative;

    span {
      opacity: 0;
    }

    &:after {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      content: attr(data-select);
      pointer-events: none;
      user-select: none;
    }
  }

  :deep(a) {
    color: inherit;
  }
}

footer {
  font-size: 14px;
  color: #fff;
  padding: 2rem 0;

  a {
    color: inherit;
    margin-left: 1em;
  }

  .footer-info-header {
    font-size: large;
    font-weight: bold;
  }
}
</style>
