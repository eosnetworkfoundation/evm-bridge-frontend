<script setup>
import { provide, reactive, ref, inject, watch } from 'vue'
import { RouterView } from 'vue-router'
import { createWeb3Modal, defaultWagmiConfig, useWeb3Modal, useWeb3ModalEvents } from '@web3modal/wagmi/vue'
import { eos, eosTestnet } from 'viem/chains'



const env = inject('env')
const i18n = inject('i18n')

const networks = {
  "Testnet": 'https://bridge.testnet.evm.eosnetwork.com',
  "Mainnet": 'https://bridge.evm.eosnetwork.com'
}
const lang = ref(i18n.global.locale.value || 'en')
const langs = {
  en: 'English',
  ko: '한국인',
  zh: '简体中文'
}
const selectLang = (val) => {
  lang.value = val
  i18n.global.locale.value = val
  localStorage.locale = val
}
  // 1. Get projectId
  const projectId = '12d2503c58f46ada41000bde1e0d0b7a'

  // 2. Create wagmiConfig
  const chains = [env === 'MAINNET' ? eos : eosTestnet]
  const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' ,
  metadata: {
    name: 'EOS EVM',
    description: 'EOS EVM',
    url: 'https://eosnetwork.com',
    icons: ['https://bridge.evm.eosnetwork.com/images/eos.png']
  },
  rpcUrl: env === 'MAINNET' ? 'https://api.evm.eosnetwork.com' : 'https://api.testnet.evm.eosnetwork.com',
})

  // 3. Create modal
  createWeb3Modal({ wagmiConfig, projectId, chains ,
    chainImages: {
    15557: '/images/eos.png',
    17777: '/images/eos.png',
  },
  themeMode: 'light',
    themeVariables: {
    //'--w3m-color-mix': '#00BB7F',
    //'--w3m-color-mix-strength': 40,
    '--w3m-font-family': '"sfmoma", sans-serif',
    '--w3m-accent':'#1E94E6',
    //'--w3m-font-size-master':,
    '--w3m-border-radius-master':'1px',
    //'--w3m-z-index':,

  }
})

  
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
          <b-nav-item-dropdown class="me-3" no-caret strategy="fixed" toggle-class="locale" >
            <template #button-content>
              {{env === 'TESTNET'?'Testnet':'Mainnet'}}
            </template>
            <b-dropdown-item :href="v" v-for="(v, k) in networks" :key="k">{{ k }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown class="me-3" no-caret strategy="fixed" toggle-class="locale">
            <template #button-content>
              <fa icon="language"/>
              {{langs[lang]}}
            </template>
            <b-dropdown-item @click="selectLang(k)" v-for="(v, k) in langs" :key="k">{{v}}</b-dropdown-item>
          </b-nav-item-dropdown>
          <w3m-button balance="hide"/>
        </b-navbar-nav>
      </b-navbar>
    </div>
  </header>
  <BModal v-model="missingNetworkModal" okOnly="true"  :okTitle="$t('app.walletconnect.failedswitch.ok')" :title="$t('app.walletconnect.failedswitch.title')"> 
    <div v-html="$t('app.walletconnect.failedswitch.content', { 'interpolation': {'escapeValue': false} })"></div>
  </BModal>
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

<script>
const missingNetworkModal = ref(false)
export default {
  name: 'app',
  inject: ['wallet', 'env'],
  mounted() {
    this.wallet.connect = useWeb3Modal()
    const events = useWeb3ModalEvents();
    
    watch(events, async (newVal,oldVal)=> {
      if (newVal.data.event == 'CONNECT_ERROR' && newVal.data.properties.message == 'Requested chains are not supported') {
        missingNetworkModal.value = true;
      }
    });

  },
}

</script>

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
