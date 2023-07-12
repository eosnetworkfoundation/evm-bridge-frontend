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
                      <b-button class="connect-btn" variant="primary" @click="connectWallet()"
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
                    <input type="number" id="amount" class="form-control" min="0" :max="balance"
                      :disabled="!wallet.connected" v-model="amount">
                    <div class="form-text">
                      {{ $t('home.myBalance') }}
                      <span id="balance" v-if="balance">{{ balance }}</span>
                    </div>
                    <div class="text-danger" v-if="exceeded">{{ $t('home.insufficient') }}</div>
                  </div>
                  <div class="col-auto">
                    <img src="../assets/eos.png" alt="EOS" style="height: 38px;" draggable="false">
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
                  <input type="text" id="address" class="form-control select" @change="calcFee" v-model="targetAddress"
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
            <span v-if="transferFee">~{{ transferFee }}EOS</span>
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
            <a class="dummy-link" @click="copyText(transactionHash)">{{ $t('home.copyEvmTx') }}</a> &nbsp&nbsp<a :href="getEvmTxExplorerUrl(transactionHash)" target="_blank" rel="noopener noreferrer">{{ $t('home.viewEvmTx') }}</a>
            <br>
            {{ $t('home.eosTx') }}
            <br>
            <span v-if="eosHash && eosHash != 'error'">{{ eosHash.slice(0, 4) + '...' + eosHash.slice(-4) }}
              <br>
            <a class="dummy-link" @click="copyText(eosHash)">{{ $t('home.copyEosTx') }}</a> &nbsp&nbsp<a :href="getEosTxExplorerUrl(eosHash)" target="_blank" rel="noopener noreferrer">{{ $t('home.viewEosTx') }}</a>
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
                      <input type="search" class="form-control" disabled value="eosio.evm" id="addr">
                      <button class="btn btn-secondary" @click="copyText('eosio.evm')">{{ $t('home.copy') }}</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-3">
                <label>{{ $t('home.depositMemoLabel') }}</label>
                <div class="form-text">
                  {{ $t('home.addressTitle') }}<br>
                  <i18n-t keypath="home.addressDesc" v-if="!address">
                    <b-link @click="connectWallet" :disabled="wallet.connecting">
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

import { Api, JsonRpc, RpcError } from 'enf-eosjs';


const rpc = new JsonRpc('https://jungle4.api.eosnation.io:443', { fetch });
const api = new Api({ rpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

const blockList = ['eosbndeposit', 'gateiowallet', 'bybitdeposit', 'bitgeteosdep', 'kucoindoteos', 'binancecleos', 'okbtothemoon']
const warningList = ['huobideposit']

export default {
  name: 'home',
  inject: ['wallet', 'env'],
  data() {
    return {
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
      extraWarning: ''
    }
  },
  created() {
    this.wallet.connect = this.connectWallet

    this.web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider('http://localhost:8545'))

    this.web3.eth.getAccounts().then(async results => {

      if (results && results.length) {
        this.address = results[0]
        this.wallet.address = this.address
        this.getBalance()
        await this.checkChainID()
        let context = this;
        Web3.givenProvider.on('accountsChanged', function (accounts) {
          context.address = Web3.utils.toChecksumAddress(accounts[0])
          context.wallet.address = context.address
          context.getBalance()
        })
        Web3.givenProvider.on('chainChanged', (_chainId) => window.location.reload());
      }
    })
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

      if (blockList.includes(this.targetAddress)) {
        return new Error(this.$t('home.cexNotSupported'))
      }

      if (warningList.includes(this.targetAddress)) {
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
        return this.web3.utils.toBN(this.web3.utils.toWei(this.amount.toString(), 'ether'))
      } catch (err) {
        return null
      }
    },
    transferFee() {
      if (this.gas && this.gasPrice) {
        return this.web3.utils.fromWei(this.gasPrice) * this.gas
      }
      return 0
    },
    exceeded() {
      return this.amount > this.balance
    }
  },
  methods: {


    async calcFee() {
      if (this.disableTransfer) {
        return
      }
      this.gasPrice = await this.web3.eth.getGasPrice()
      this.gas = await this.web3.eth.estimateGas({
        from: this.address,
        to: this.addressEvm,
        value: this.transferValue,
        gasPrice: this.gasPrice,
        data: this.bytesToHex(this.stringToUTF8Bytes(this.memo)),
      })
    },

    async checkChainID() {
      let chainId = await this.web3.eth.getChainId()
      let targetChainid = (this.env === "TESTNET" ? 15557 : 17777);
      let targetChainidHEX = (this.env === "TESTNET" ? "0x3CC5" : "0x4571");
      let targetApiAddr = (this.env === "TESTNET" ? "https://api.testnet.evm.eosnetwork.com/" : "https://api.evm.eosnetwork.com/");
      let targetExplorerAddr = (this.env === "TESTNET" ? "https://explorer.testnet.evm.eosnetwork.com" : "https://explorer.evm.eosnetwork.com");
      let targetNetworkName = (this.env === "TESTNET" ? "EOS-EVM Testnet2" : "EOS-EVM");
      console.log(chainId)
      if (chainId != targetChainid) {
        try {
          window.alert(this.$t('home.swtichNetPrompt'))
          await Web3.givenProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainidHEX }],
          });

        } catch (switchError) {

          // The network has not been added to MetaMask
          if (switchError.code === 4902) {

            if (window.confirm(this.$t('home.addNetPrompt'))) {
              await Web3.givenProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: targetChainidHEX,
                  chainName: targetNetworkName,
                  nativeCurrency: {
                    name: 'EOS',
                    symbol: 'EOS',
                    decimals: 18
                  },
                  rpcUrls: [targetApiAddr],
                  blockExplorerUrls: [targetExplorerAddr]
                }]
              })

              await Web3.givenProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainidHEX }],
              });

            }

          }
          console.log("Cannot switch to the network.")
          console.log(switchError)

        }
      }
    },

    async connectWallet() {
      try {
        this.wallet.connecting = true
        let results = await this.web3.eth.getAccounts()
        if (!results.length) {
          results = await this.web3.eth.requestAccounts()
        }
        this.address = results[0]
        this.wallet.address = this.address
        await this.checkChainID()
        this.getBalance()
      } finally {
        this.wallet.connecting = false
      }
    },
    async getBalance() {
      try {
        const address = this.address
        this.wallet.connecting = true
        this.wallet.connected = false
        const wei = await this.web3.eth.getBalance(address)
        this.balance = this.web3.utils.fromWei(wei, 'ether')
        this.wallet.connected = true
      } finally {
        this.wallet.connecting = false
      }
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
        
        if (!window.confirm(this.$t('home.transferConfirm', [this.amount, this.targetAddress]))) {
          return
        }
        this.gas = await this.web3.eth.estimateGas({
          from: this.address,
          to: this.addressEvm,
          value: this.transferValue,
          gasPrice: this.gasPrice,
          data: this.bytesToHex(this.stringToUTF8Bytes(this.memo)),
        });
        var vm = this

        // Send EVM Transaction
        await this.web3.eth.sendTransaction({
          from: this.address,
          to: this.addressEvm,
          value: this.transferValue,
          gas: this.gas,
          data: this.bytesToHex(this.stringToUTF8Bytes(this.memo)),
        }).on('receipt', async function (receipt) {
          // Receipt contains tx hash.
          vm.transactionHash = receipt.transactionHash
          vm.eosHash = ''
          // Get block containing the tx/
          const blockinfo = await vm.web3.eth.getBlock(receipt.blockHash)

          // Eos block hash is in the mixHash field of the evm block header.
          var hash = blockinfo.mixHash.slice(2)

          // Fetch EOS block, we do not use the function provided by the package as it miss fields in the return value.
          var r = await rpc.fetch('/v1/chain/get_block', { block_num_or_id: hash })
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
            (e) => e.account === 'eosio.evm' && e.data && e.data.rlptx && vm.web3.utils.keccak256("0x" + e.data.rlptx) === vm.transactionHash
          )

          // One EVM block will cover one second of time. So there will be two EOS blocks.
          // If we cannot find the tx in the block located by the mixHash, try the previous one.
          // It's in theory possible to have more than or less than two EOS blocks related to one EVM block,
          // but for the frontend display, hardcoded two queries should be fine. 
          // We can make the logic more general and more robust if necessary.
          if (txs.length == 0) {
            var r2 = await rpc.fetch('/v1/chain/get_block', { block_num_or_id: r.previous })

            txs = r2.transactions.map((t) => {
              if (t.trx.transaction != undefined) {
                return t.trx.transaction.actions.map((e) => { e.txid = t.trx.id; return e });
              }
              else return [];
            }).flat().filter(
              (e) => e.account === 'eosio.evm' && e.data && e.data.rlptx && vm.web3.utils.keccak256("0x" + e.data.rlptx) === vm.transactionHash
            )


          }
          // Should only found one though....
          if (txs.length > 0) {
            vm.eosHash = txs[0].txid
          }
          else {
            vm.eosHash = "error"
          }
        })

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
  width: 142px;
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
</style>
