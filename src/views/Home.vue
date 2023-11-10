<template>
  <div class="home container">
    <b-tabs class="no-fade" nav-class="nav-tabs-card">
      <b-tab :title="$t('home.withdraw')">
        <div class="withdraw" id="withdraw">
          <b-card>
            <b-row align-v="center">
              <b-col class="text-center text-sm-start" sm="auto" style="min-width: 4em;">
                <b>{{ $t('home.from') }}</b>
              </b-col>
              <b-col>
                <div class="mb-3">
                  <div class="row align-items-end">
                    <div class="col">
                      <label for="from">{{ $t('home.address') }}</label>
                      <input type="search" id="from" class="form-control" v-model="address" maxlength="42" disabled>
                    </div>
                    <div class="col col-auto">
                      <b-button class="connect-btn" variant="primary" @click="wallet.connect.open()"
                        :disabled="wallet.connecting">
                        <span v-if="wallet.connected">{{ $t('home.connected') }}</span>
                        <span v-else-if="wallet.connecting">{{ $t('home.connecting') }}</span>
                        <span v-else>{{ $t('home.connectWallet') }}</span>
                      </b-button>

                    </div>
                  </div>
                </div>

                <div class="row align-items-center">
                  <div class="col">
                    <label for="amount">{{ $t('home.amount') }}</label>
                    <input type="number" id="amount" class="form-control" min="0" :max="balance" v-model="amount">
                    <div class="form-text">
                      {{ $t('home.myBalance') }}
                      <span id="balance" v-if="balance">{{ balance }}</span>
                    </div>
                    <div class="text-danger" v-if="exceeded">{{ $t('home.insufficient') }}</div>
                  </div>
                  <div class="col-auto">
                    <div class="connect-btn">
                      <b-dropdown variant="outline-secondary" style="height:auto; width:100%;">
                        <template #button-content>
                          <div class="my_dropdown-toggle">
                            <img :src="tokenList[selectedToken].logo"
                              style="margin-right:5px; height:25px; width:25px;object-fit:contain;">
                            {{ tokenList[selectedToken].name }}
                          </div>

                        </template>
                        <b-dropdown-item v-for="(item, index) in tokenList" @click="onSelectToken(index)">
                          <img :src="item.logo" style="margin-right:5px; height:25px; width:25px;object-fit:contain;">
                          {{ item.name }}
                        </b-dropdown-item>
                      </b-dropdown>
                    </div>
                  </div>
                </div>
              </b-col>
            </b-row>
          </b-card>

          <div class="text-center text-white py-3">
            <fa icon="arrow-down" size="2x" />
          </div>

          <b-card>
            <b-row align-v="center">
              <b-col class="text-center text-sm-start" sm="auto" style="min-width: 4em;">
                <b>{{ $t('home.to') }}</b>
              </b-col>
              <b-col>
                <div class="mb-3">
                  <label for="address">{{ $t('home.destinationAccount') }}</label>
                  <div class="form-text mb-2">{{ $t('home.destinationAccountDesc') }}</div>
                  <input type="text" id="address" class="form-control select" v-model="targetAddress"
                    maxlength="13" list="addresses">
                  <div class="form-text font-monospace" v-if='extraWarning !== ""'>
                    <span style="color: red">{{ extraWarning }}</span>
                  </div>
                  <div class="form-text font-monospace" v-if="addressEvm">
                    <span v-if="addressEvm.message">{{ addressEvm.message }}</span>
                    <span v-else>{{ addressEvm }}</span>
                  </div>
                </div>
                <div>
                  <label class="mb-1" for="memo" id="memoTooltip">
                    {{ $t('home.memoLabel') }}
                    <span class="text-success">
                      <fa icon="info-circle" />
                    </span>
                  </label>
                  <b-popover target="memoTooltip" triggers="hover focus">
                    {{ $t('home.memoTooltip') }}
                  </b-popover>
                  <input type="text" id="memo" class="form-control" v-model="memo">
                </div>
              </b-col>
            </b-row>
          </b-card>

          <div class="d-grid mt-4">
            <b-button variant="primary" @click="transfer" class="transfer-btn" :disabled="disableTransfer">
              <span v-if="submitting">{{ $t('home.transferOngoing') }}</span>
              <span v-else-if="finished">{{ $t('home.transferSuccess') }}</span>
              <span v-else>{{ $t('home.transfer') }}</span>
            </b-button>
          </div>

          <div class="mt-2 text-center small text-white">
            {{ $t('home.gasFee') }}
            <span v-if="tokenName() === 'EOS'">~0.0032 EOS</span>
            <span v-else>~0.016 EOS</span>
            <span v-if="tokenName() != 'EOS'">
              <br>
              {{ $t('home.bridgeFee') }} 0.01 EOS
            </span>
            <br>
            {{ $t('home.transferTime', ['~5 s']) }}
            <br>
            {{ $t('home.exchangeTime', ['~ 3 mins']) }}
          </div>

          <div class="transaction-hash" v-if="transactionHash">
            {{ $t('home.lastTransaction') }}
            <br>
            {{ transactionHash.slice(0, 6) + '...' + transactionHash.slice(-4) }}
            <br>
            <a class="dummy-link" @click="copyText(transactionHash)">{{ $t('home.copyEvmTx') }}</a> &nbsp&nbsp<a
              :href="getEvmTxExplorerUrl(transactionHash)" target="_blank" rel="noopener noreferrer">{{
                $t('home.viewEvmTx') }}</a>
            <br>
            {{ $t('home.eosTx') }}
            <br>
            <span v-if="eosHash && eosHash != 'error'">{{ eosHash.slice(0, 4) + '...' + eosHash.slice(-4) }}
              <br>
              <a class="dummy-link" @click="copyText(eosHash)">{{ $t('home.copyEosTx') }}</a> &nbsp&nbsp<a
                :href="getEosTxExplorerUrl(eosHash)" target="_blank" rel="noopener noreferrer">{{ $t('home.viewEosTx')
                }}</a>
            </span>
            <span v-else-if="eosHash == 'error'">{{ $t('home.eosTxError') }}</span>
            <span v-else>{{ $t('home.eosTxPending') }}</span>
          </div>
          <div class="error" v-if="transactionError">{{ transactionError }}</div>
        </div>
      </b-tab>
      <b-tab :title="$t('home.deposit')">
        <b-card>
          <b-row align-v="center">
            <b-col class="text-center text-sm-start" sm="auto" style="min-width: 4em;">
              <b>{{ $t('home.from') }}</b>
            </b-col>
            <div class="col">
              <span style="color: red">
                <p v-if="env === 'TESTNET'">{{ $t('home.netWarning.testnet') }}</p>
                <p v-else>{{ $t('home.netWarning.mainnet') }}</p>

                <p>{{ $t('home.netWarning.desc') }}</p>
              </span>
              <p>{{ $t('home.eos2evmDesc.p1') }}</p>
              <p>{{ $t('home.eos2evmDesc.p2') }}</p>
              <p v-if="env === 'TESTNET'">{{ $t('home.eos2evmDesc.p3.testnet') }}</p>
              <p v-else>{{ $t('home.eos2evmDesc.p3.mainnet') }}</p>
            </div>
          </b-row>
        </b-card>
        <div class="text-center text-white mt-3">
          <fa icon="arrow-down" size="2x" />
        </div>
        <b-card class="mt-3">
          <b-row align-v="center">
            <b-col class="text-center text-sm-start" sm="auto" style="min-width: 4em;">
              <b>{{ $t('home.to') }}</b>
            </b-col>
            <div class="col">
              <div class="mb-3">
                <label>{{ $t('home.destinationAccount') }}</label>
                <div class="form-text">{{ $t('home.destinationAccountDescCopy') }}</div>
                <div class="row align-items-end">
                  <div class="col">
                    <div class="input-group">
                      <input type="search" class="form-control" disabled value="eosio.evmin" id="addr">
                      <button class="btn btn-secondary" @click="copyText('eosio.evmin')">{{ $t('home.copy') }}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label>{{ $t('home.depositMemoLabel') }}</label>
                <div class="form-text">
                  {{ $t('home.addressTitle') }}<br>
                  <i18n-t keypath="home.addressDesc" v-if="!address">
                    <b-link @click="wallet.connect.open()" :disabled="wallet.connecting">
                      <fa icon="spinner" spin v-if="wallet.connecting" />
                      {{ $t('home.connectEvmWallet') }}
                    </b-link>
                  </i18n-t>
                </div>
                <div class="input-group">
                  <input type="text" class="form-control" disabled :value="address" id="deposit-memo">
                  <button class="btn btn-secondary" :disabled="!address" @click="copyText(address)">
                    {{ $t('home.copy') }}
                  </button>
                </div>

              </div>
            </div>
          </b-row>
        </b-card>

        <div class="d-grid mt-4 text-center small text-white">
          {{ $t('home.depositDesc') }}
        </div>

        <div class="mt-2 text-center small text-white">
          {{ $t('home.bridgeFee') }}
          <span>0.01 EOS</span>
          <br>
          {{ $t('home.transferTime', ['~ 5 s']) }}
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import Web3 from 'web3'
import BN from 'bn.js'
import clipboardCopy from '../utils/copy-text'
import erc20_abi from '../erc20.json'

import { JsonRpc, RpcError } from 'enf-eosjs';


import { getAccount, fetchBalance, getContract, fetchFeeData, sendTransaction, getPublicClient, getWalletClient, fetchTransaction, waitForTransaction, writeContract, disconnect, watchAccount, watchNetwork, switchNetwork, getNetwork } from '@wagmi/core'
import { compileScript } from 'vue/compiler-sfc';



export default {
  name: 'home',
  inject: ['wallet', 'env'],
  data() {
    return {
      rpc: null,
      address: '',
      balance: '',
      memo: '',
      amount: '',
      targetAddress: '',
      gas: '',
      gasPrice: '',
      transactionHash: '',
      eosHash: '',
      tab: '',
      submitting: false,
      finished: false,
      transactionError: '',
      extraWarning: '',
      tokenList: null,
      selectedToken: 0,
      tokenListTestnet: [
        { name: 'EOS', addr: '', logo: 'images/eos.png' },
        { name: 'JUNGLE', addr: '0x4ea3b729669bF6C34F7B80E5D6c17DB71F89F21F', logo: 'images/jungle.png', erc20_contract: null },
      ],
      tokenListMainnet: [
        { name: 'EOS', addr: '', logo: 'images/eos.png', 
        blockList:  ['eosbndeposit', 'bybitdeposit', 'bitgeteosdep', 'kucoindoteos', 'binancecleos'], 
        warningList: ['huobideposit', 'okbtothemoon', 'gateiowallet', 'coinbasebase', 'krakenkraken'] 
      },
        { name: 'USDT', addr: '0x33B57dC70014FD7AA6e1ed3080eeD2B619632B8e', logo: 'images/usdt.png' , 
        blockList:  ['eosbndeposit', 'bybitdeposit', 'bitgeteosdep', 'kucoindoteos', 'binancecleos', 'coinbasebase', 'krakenkraken', 'huobideposit', 'okbtothemoon'], 
        warningList: ['gateiowallet'] 
      },
      ],
    }
  },
  created() {

    this.rpc = (this.env === "TESTNET" ? new JsonRpc('https://jungle4.api.eosnation.io:443', { fetch }) : new JsonRpc('https://eos.api.eosnation.io:443', { fetch }));
    // this.wallet.connect = this.connectWallet


    this.tokenList = this.env === "TESTNET" ? this.tokenListTestnet : this.tokenListMainnet;
    this.selectedToken = 0;

    for (var item of this.tokenList) {
      if (item.addr != '') {
        item.erc20_contract = getContract({
          address: item.addr,
          abi: erc20_abi,
        })
      }
    }
    const account = getAccount()
    watchAccount((account) => {
      this.address = account.address
      this.wallet.connected = account.isConnected;


      this.getBalance()
    })

    watchNetwork((network) => this.checkChainID(network))

    if (account.isConnected) {
      this.address = account.address
      this.getBalance()
    }
  },
  watch: {
    amount(val) {
      if (val < 0) {
        this.amount = 0
      }
    }
  },
  computed: {

    disableTransfer() {
      return !this.addressEvm || this.addressEvm instanceof Error || this.submitting || this.finished || this.exceeded || !this.transferValue
    },
    addressEvm() {
      if (!this.targetAddress) {
        this.extraWarning = ''
        return ''
      }

      if (this.blockList()?.includes(this.targetAddress)) {
        this.extraWarning = ''
        return new Error(this.$t('home.cexNotSupported'))
      }

      if (this.warningList()?.includes(this.targetAddress)) {
        this.extraWarning = this.$t('home.cexExtraWarning')
      } else {
        this.extraWarning = ''
      }

      return this.convertAddress(this.targetAddress)
    },
    transferValue() {
      if (!this.amount) {
        return null
      }
      try {
        if (this.tokenName() == "EOS") {
          return Web3.utils.toBN(Web3.utils.toWei(this.amount.toString(), 'ether')).toString()
        }
        else {
          return Web3.utils.toBN(Web3.utils.toWei(this.amount.toString(), 'mwei')).toString()
        }
      } catch (err) {
        return null
      }
    },
    transferFee() {
      if (this.gas && this.gasPrice) {
        return Web3.utils.fromWei(this.gasPrice) * this.gas
      }
      return 0
    },
    exceeded() {
      return this.amount > this.balance
    }
  },
  methods: {

    erc20_contract() { return this.tokenList[this.selectedToken].erc20_contract; },
    erc20_addr() { return this.tokenList[this.selectedToken].addr; },
    tokenName() { return this.tokenList[this.selectedToken].name; },

    blockList() { return this.tokenList[this.selectedToken].blockList; },
    warningList() { return this.tokenList[this.selectedToken].warningList; },

    async getPrice() {

      const feeData = await fetchFeeData({
        formatUnits: 'wei',
      })

      this.gasPrice = new BN(feeData.formatted.gasPrice)

    },

    async checkChainID(network) {
      if (!network || !network.chain) {
        return
      }
      let targetChainid = (this.env === "TESTNET" ? 15557 : 17777);
      if (network.chain.id != targetChainid) {
        window.alert(this.$t('home.swtichNetPrompt'))
        switchNetwork({ chainId: targetChainid }).then((r) => {
          window.location.reload()
        })
      }
    },

    async connectWallet() {

    },
    async getBalance() {

      const address = this.address
      if (!address) {
        return
      }
      if (this.tokenName() === 'EOS') {
        const bal = await fetchBalance({
          address,
          formatUnits: 'wei',
        })
        const wei = new BN(bal.formatted)
        this.balance = Web3.utils.fromWei(wei, 'ether')
      }
      else {
        if ((this.erc20_contract())) {
          const wei = new BN((await this.erc20_contract().read.balanceOf([address])).toString())
          this.balance = Web3.utils.fromWei(wei, 'mwei')
        }
        else { this.balance = null; }
      }

    },

    onSelectToken(index) {
      this.selectedToken = index;
      this.getBalance()
    },

    stringToUTF8Bytes(string) {
      return new TextEncoder().encode(string);
    },

    bytesToHex(bytes) {
      return "0x" + Array.from(
        bytes,
        byte => byte.toString(16).padStart(2, "0")
      ).join("");
    },

    getEvmTxExplorerUrl(tx) {
      let targetExplorerAddr = (this.env === "TESTNET" ? "https://explorer.testnet.evm.eosnetwork.com" : "https://explorer.evm.eosnetwork.com");
      return targetExplorerAddr + '/tx/' + tx
    },

    getEosTxExplorerUrl(tx) {
      let targetExplorerAddr = (this.env === "TESTNET" ? "https://jungle4.eosq.eosnation.io" : "https://eos.eosq.eosnation.io");
      return targetExplorerAddr + '/tx/' + tx
    },

    async transfer() {
      try {
        this.submitting = true

        if (!window.confirm(this.$t('home.transferConfirm', [this.amount, this.tokenName(), this.targetAddress]))) {
          return
        }

        var vm = this

        let tx = null;
        
        await this.getPrice()

        if (this.tokenName() === 'EOS') {
          tx = await sendTransaction({
            from: this.address,
            to: this.addressEvm,
            value: this.transferValue,
            gasPrice: this.gasPrice,
            data: this.bytesToHex(this.stringToUTF8Bytes(this.memo)),
          })
        }
        else {
          // USDT
          const fee = (await this.erc20_contract().read.egressFee()).toString()

          tx = await writeContract({
            address: this.erc20_addr(),
            abi: erc20_abi,
            functionName: 'bridgeTransfer',
            args: [this.addressEvm, this.transferValue, this.memo],
            value: fee
          })

        }
        const receipt = await waitForTransaction({
          confirmations: 1,
          hash: tx.hash,
        })
        vm.transactionHash = receipt.transactionHash
        const blockinfo = await getPublicClient().getBlock({ blockHash: receipt.blockHash })

        var hash = blockinfo.mixHash.slice(2)

        // Fetch EOS block, we do not use the function provided by the package as it miss fields in the return value.
        var r = await vm.rpc.fetch('/v1/chain/get_block', { block_num_or_id: hash })
        // EOS tx id is the result.transactions.trx.id
        // EVM tx is in eos_block.transactions.trx.transaction.actions[n]
        // There should be only one action in each eos transaction for those EVM transactions.
        // We can filter the action by action.account === 'eosio.evm' and locate the rlptx of the EVM tx in action.data.rlptx
        // EVM tx hash = keccak256(rlptx)
        var txs = r.transactions.map((t) => {
          if (t.trx.transaction != undefined) {
            return t.trx.transaction.actions.map((e) => { e.txid = t.trx.id; return e });
          }
          else return [];
        }).flat().filter(
          (e) => e.account === 'eosio.evm' && e.data && e.data.rlptx && Web3.utils.keccak256("0x" + e.data.rlptx) === vm.transactionHash
        )

        // One EVM block will cover one second of time. So there will be two EOS blocks.
        // If we cannot find the tx in the block located by the mixHash, try the previous one.
        // It's in theory possible to have more than or less than two EOS blocks related to one EVM block,
        // but for the frontend display, hardcoded two queries should be fine. 
        // We can make the logic more general and more robust if necessary.
        if (txs.length == 0) {
          var r2 = await vm.rpc.fetch('/v1/chain/get_block', { block_num_or_id: r.previous })

          txs = r2.transactions.map((t) => {
            if (t.trx.transaction != undefined) {
              return t.trx.transaction.actions.map((e) => { e.txid = t.trx.id; return e });
            }
            else return [];
          }).flat().filter(
            (e) => e.account === 'eosio.evm' && e.data && e.data.rlptx && Web3.utils.keccak256("0x" + e.data.rlptx) === vm.transactionHash
          )


        }
        // Should only found one though....
        if (txs.length > 0) {
          vm.eosHash = txs[0].txid
        }
        else {
          vm.eosHash = "error"
        }

        this.getBalance()
        this.targetAddress = ''
        this.amount = ''
        this.gas = ''
        this.finished = true
        setTimeout(() => {
          this.finished = false
        }, 2000)
      } catch (err) {
        console.error(err)
        this.transactionError = err.message
      } finally {
        this.submitting = false
      }
    },
    convertAddress(source) {
      try {
        return uint64ToAddr(strToUint64(source, this.$t))
      } catch (err) {
        return err
      }

      function charToSymbol(c, t) {
        const a = 'a'.charCodeAt(0)
        const z = 'z'.charCodeAt(0)
        const one = '1'.charCodeAt(0)
        const five = '5'.charCodeAt(0)
        const charCode = c.charCodeAt(0)
        if (charCode >= a && charCode <= z) {
          return charCode - a + 6
        }
        if (charCode >= one && charCode <= five) {
          return charCode - one + 1
        }
        if (c === '.') {
          return 0
        }
        throw new Error(t('home.addressCheck.invalidAddress'))
      }

      function strToUint64(str, t) {
        var n = new BN()
        var i = str.length
        if (i >= 13) {
          // Only the first 12 characters can be full-range ([.1-5a-z]).
          i = 12

          // The 13th character must be in the range [.1-5a-j] because it needs to be encoded
          // using only four bits (64_bits - 5_bits_per_char * 12_chars).
          n = new BN(charToSymbol(str[12], t))
          if (n >= 16) {
            throw new Error(t('home.addressCheck.invalid13Char'))
          }
        }
        // Encode full-range characters.

        while (--i >= 0) {
          n = n.or(new BN(charToSymbol(str[i]), t).shln((64 - 5 * (i + 1))))
        }
        return n.toString(16, 16)
      }

      function uint64ToAddr(str) {
        return '0xbbbbbbbbbbbbbbbbbbbbbbbb' + str
      }
    },
    copyText(val) {
      return clipboardCopy(val).then(() => {
        this.$alert.success(this.$t('home.addrCopied'))
      })
    }
  }
}
</script>

<style scoped lang="scss">
.transfer-btn {
  margin: auto;
  width: 170px;
  border-radius: 5px;
  opacity: 1;

  background: linear-gradient(270deg, #1E94E6 0%, #75C7FF 100%);

  box-shadow: inset 0px -1px 2px 0px rgba(0, 0, 0, 0.3);
}

.connect-btn {
  width: 142px !important;
  margin-left: -12px;
}

@media (max-width: 400px) {
  .transfer-btn {
    width: 340px;
  }
}

.home {
  max-width: 640px;
}

.card {
  border-color: transparent;

  &:first-child {
    border-top-left-radius: 0;
  }
}
</style>

<style lang="scss">
.popover {
  background-color: #4F5561 !important;
  color: #fff !important;
  --bs-popover-body-color: #fff !important;
  width: 450px;

}

.nav-tabs-card.nav-tabs {
  border-width: 0;

  .nav-link {
    background-color: #999;
    color: #fff;
    border-width: 0;
    padding-left: 2em;
    padding-right: 2em;
  }
}

.tabs.no-fade {
  .fade {
    transition: none;
  }
}

.transaction-hash {
  color: #fff;
}

.dummy-link {
  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));
  cursor: pointer;
}

.dropdown-toggle::after {
  content: unset !important;
}

.my_dropdown-toggle::after {
  display: inline-block;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
}

.error {
  color: #fff;
}
</style>
