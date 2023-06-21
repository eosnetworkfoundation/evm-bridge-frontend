<script lang="ts"> 
 import { browser } from '$app/environment';
 import { onMount } from 'svelte';
 import { ethers, BigNumber } from 'ethers';
 import Icon from '@iconify/svelte';
 
 import { convertAddress, truncateAddress, stringToHexString } from '@/utils/string-utils';
 import { wallet } from '@/stores';

 const chainIdDetails = {
     testnet: {
         targetChainId: 15557,
         targetChainIdHex: '0x3CC5',
         targetApiAddress: 'https://api.testnet.evm.eosnetwork.com/',
         targetExplorerAddress: 'https://explorer.testnet.evm.eosnetwork.com',
         targetNetworkName: 'EOS-EVM Testnet2'
     },
     mainnet: {
         targetChainId: 17777,
         targetChainIdHex: '0x4571',
         targetApiAddress: 'https://api.evm.eosnetwork.com/',
         targetExplorerAddress: 'https://explorer.evm.eosnetwork.com',
         targetNetworkName: 'EOS-EVM'
     }
 };
 
 const blockList = ['eosbndeposit', 'gateiowallet', 'bybitdeposit', 'bitgeteosdep', 'kucoindoteos', 'binancecleos', 'okbtothemoon']
 const warningList = ['huobideposit']
 const WITHDRAW = 'WITHDRAW';
 const DEPOSIT = 'DEPOSIT';

 let activeTab = WITHDRAW;
 
 let sourceAddress = '';
 let destinationAddress = '';
 let evmAddress = '';
 let transactionHash = '';
 
 let balance = 0;
 let amount = 0;
 let memo = '';
 let gasPrice = 0;
 
 let provider: unknown;
 let signer: unknown;
 let account: unknown;
 let gas: unknown;
 
 let isSubmitting = false;
 let isFinished = false;
 let isExceeded = false;
 
 const isTestnet = () => browser && location.host !== 'bridge.evm.eosnetwork.com';

 onMount(() => {
     provider = new ethers.providers.Web3Provider(window.ethereum);
 });

 function switchTab(tab: WITHDRAW | DEPOSIT) {
     activeTab = tab;
     if (activeTab === DEPOSIT) {
         destinationAddress = 'eosio.evm';
         memo = sourceAddress;
     } else {
         destinationAddress = '';
         memo = '';
     }
 }
 
 async function connectWallet() {
     if (sourceAddress || !provider) return;
     
     const [primaryAccount] = await provider.send("eth_requestAccounts", []) ?? [];
     if (!primaryAccount) return;

     sourceAddress = primaryAccount;
     switchTab(activeTab);
     signer = provider.getSigner();
     await getBalance();
 };

 function clampAmount() {
     amount = Math.min(Math.max(amount, 0), balance);
 }

 function isTransferDisabled(): boolean {
     return !evmAddress || evmAddress instanceof Error || submitting || finished || exceeded || !transferValue;
 }

 function transferValue(): BigNumber | null {
     if (Number.isNaN(Number(amount))) return null;
     const amountInEther = parseEther(amount);
     return parseUnits(amountInEther, 'wei');
 }
 
 function transferFee(): number {
     if (!gas || !gasPrice) return 0;
     return parseUnits(gasPrice.toString(), 'wei') * gas;
 }

 async function getBalance() {
     if (!sourceAddress) return;
     
     const accountBalance = await provider.getBalance(sourceAddress);
     if (!accountBalance) return;

     balance = accountBalance.toNumber();
 }

 async function calculateFee() {
     if (isTransferDisabled()) return;

     gasPrice = await provider.getGasPrice();
     gas = await provider.estimateGas({
         to: evmAddress,
         value: transferValue(),
         data: stringToHexString(memo),
     });
 }

 async function checkChainID() {
     if (!signer) return;

     const chainId = await signer.getChainId();
     const {
         targetChainId,
         targetChainIdHex,
         targetApiAddress,
         targetExplorerAddress,
         targetNetworkName
     } = chainIdDetails[isTestnet() ? 'testnet' : 'mainnet'] ?? {};
     if (chainId === targetChainId) return;

     // Alerts
 }

 async function transfer() {
     try {
         isSubmitting = true;
         transactionHash = '';
         
         // Alerts

         calculateFee();

         const result = await signer.sendTransaction({
             from: sourceAddress,
             to: destinationAddress,
             value: ethers.utils.parseEther(amount),
             nonce: window.ethersProvider.getTransactionCount(sourceAddress, 'latest'),
             gasLimit: ethers.utils.hexlify('0x100000'),
             gasPrice
         });

         transactionHash = result.transactionHash;
         getBalance();
         destinationAddress = '';
         amount = 0;
         gas = 0;
         isFinished = true;
         setTimeout(() => {
             isFinished = false;
         }, 2000);
     } catch (error) {
         console.error(error);
     } finally {
         isSubmitting = false;
     }
 }
 
 $: evmAddress = destinationAddress ? convertAddress(destinationAddress) : '';
</script>

<header class="flex flex-row justify-between items-center p-5">
    <div class="logo flex flex-row items-center justify-center">
        <img src="/eos_evm_{isTestnet() ? 'testnet_' : ''}logo.svg" alt="EOS EVM Logo" style="filter:invert(1); height: 45px;"/>
        <div class="logo flex flex-row items-center ml-5 my-0">
            <p class="cursor-pointer text-white">Switch Network</p>
            <Icon class="ml-2" icon="mdi:menu-down" color="white" height="22" />
        </div>
    </div>
    <div class="flex flex-row items-center">
        <div class="about">
            <a class="pr-3 text-grey cursor-pointer text-white" href="https://docs.eosnetwork.com/docs/latest/eos-evm/">Docs</a>
            <a class="pr-5 text-grey cursor-pointer text-white" href="https://docs.eosnetwork.com/docs/latest/eos-evm/">FAQ</a>
        </div>
        <div class="connect-wallet flex flex-row" on:click="{connectWallet}">
            {#if sourceAddress}
                <p class="border-black border rounded-lg py-1.5 px-4 bg-blue-400 text-white">{truncateAddress(sourceAddress)}</p>
            {:else}
                <p class="border-white border rounded-lg py-1.5 px-4 text-white cursor-pointer">Connect Wallet</p>
            {/if}
        </div>
    </div>
</header>

<article class="router w-5/6 p-5 flex flex-col items-center m-auto">
    <section class="w-full">
        <div class="tab-switcher flex flex-row">
            <div
                on:click="{() => switchTab(WITHDRAW)}"
                class="tab py-2 px-4 w-1/6 text-center rounded-t-md select-none cursor-pointer truncate {activeTab === WITHDRAW ? 'bg-white text-black' : 'text-white bg-gray-400'}">
                Withdraw
            </div>
            <div
                on:click="{() => switchTab(DEPOSIT)}"
                class="tab py-2 px-4 w-1/6 text-center rounded-t-md select-none cursor-pointer truncate {activeTab === DEPOSIT ? 'bg-white text-black' : 'text-white bg-gray-400 '}">
                Deposit
            </div>
        </div>
        <div class="box flex flex-row items-center justify-between bg-white rounded-b-md rounded-r-md overflow-x-hidden">
            {#if activeTab === WITHDRAW}
                {#if sourceAddress}
                    <span class="font-bold text-md px-4">From</span>
                    <div class="fields grid gap-2 grid-cols-6 grid-rows-3 items-center p-4 w-full">
                        <span class="text-sm text-right mr-2">Address</span>
                        <span class="col-span-4 text-sm text-right bg-gray-200 select-none overflow-x-hidden rounded p-1">{truncateAddress(sourceAddress)}</span>
                        <span></span>
                        <span class="text-sm text-right mr-2">Balance</span>
                        <span class="col-span-4 text-sm text-right bg-gray-200 select-none rounded p-1">{balance}</span>
                        <span class="text-sm text-gray-400 ml-1">EOS</span>
                        <span class="text-sm text-right mr-2">Amount</span>
                        <input class="col-span-4 text-sm text-right rounded p-1 border-b" name="amount" type="number" bind:value="{amount}" on:blur="{clampAmount}" />
                        <span class="text-sm ml-1 text-gray-400">EOS</span>
                    </div>
                {:else}
                    <div class="p-4">
                        <span class="text-gray-400">Please connect a wallet first.</span>
                    </div>
                {/if}
            {:else if activeTab === DEPOSIT}
                <div class="fields items-center p-4 w-full">
                    <span class="text-sm text-red-500">
                        <span class="font-bold">Warning! This is the {isTestnet() ? 'TESTNET' : 'MAINNET'}.</span>
                        <p class="text-sm">
                            Please confirm that your wallet is connected to the
                            correct network before making a transfer. Using the wrong network may result in potential loss of
                            assets.
                        </p>
                    </span>
                    <p class="text-sm my-1">
                        Please use a wallet that supports the EOS Network, such as Anchor, Wombat, Tokenpocket or a centralized
                        exchange such as Binance, Coinbase, etc.
                    </p>
                    <p class="text-sm">
                        To transfer funds to the following EOS contract address, please fill in the EVM destination address in the
                        memo to complete the deposit to EVM.
                    </p>
                </div>
            {/if}
            <img class="w-32 p-5" src="/eos.png" alt="EOS" draggable="false">
        </div>
    </section>
    <Icon class="m-3" icon="bi:arrow-down" color="white" width="32" height="32" />
    <section class="w-full flex flex-col items-center">
        <div class="box flex flex-row items-center w-full h-1/4 p-2 bg-white rounded-md mb-4">
            <span class="font-bold text-md px-4">To</span>
            <div class="fields grid gap-2 grid-cols-6 grid-rows-3 items-center p-4 w-full">
                <span class="text-sm text-right mr-2">Address</span>
                <input class="col-span-5 text-sm rounded p-1 border-b {activeTab === DEPOSIT ? 'bg-gray-200 select-none rounded' : ''}" name="destination" type="text" disabled="{activeTab === DEPOSIT}" bind:value={destinationAddress}/>
                <span class="col-start-2 col-span-5 text-sm text-gray-400 italic mr-2">{evmAddress}</span>
                <span class="text-sm text-right mr-2">Memo</span>
                <input class="col-span-5 text-sm rounded p-1 border-b {activeTab === DEPOSIT ? 'bg-gray-200 select-none rounded' : ''}" disabled="{activeTab === DEPOSIT}" name="memo" type="text" bind:value={memo} />
            </div>
        </div>
        <div class="transfer-button rounded w-1/4 px-5 py-2 bg-blue-400 text-white text-center cursor-pointer">Transfer</div>
        <div class="estimates text-sm text-center text-white my-3">
            {#if activeTab === WITHDRAW}
                <p class="underline">Gas Fees</p>
                <p>Time To Transfer: ~5 secs</p>
                <p>Time To Exchanges: ~3 mins</p>
            {:else if activeTab === DEPOSIT}
                <p>Bridge Fee: 0.01 EOS</p>
                <p>Time To Transfer: ~5 secs</p>
            {/if}
        </div>
    </section>
</article>

<footer class="p-5">
    <nav class="flex flex-row justify-between items-center h-20 pb-5">
        <p class="text-sm w-1/2 text-white">&copy; 2023 EOS Network Foundation. All rights reserved.</p>
        <div class="socials flex flex-row justify-around">
            <a href="https://twitter.com/EosNFoundation">
                <Icon class="mx-3" icon="bi:twitter" color="white" width="22" height="22" />
            </a>
            <a href="https://discord.gg/eos-network">
                <Icon class="mx-3" icon="bi:discord" color="white" width="22" height="22" />
            </a>
            <a href="https://t.me/eosevm">
                <Icon class="mx-3" icon="bi:telegram" color="white" width="22" height="22" />
            </a>
            <a href="https://www.youtube.com/@EOSNetworkFoundation">
                <Icon class="mx-3" icon="bi:youtube" color="white" width="22" height="22" />
            </a>
        </div>
    </nav>
</footer>
