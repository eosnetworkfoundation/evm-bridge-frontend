<script lang="ts">
 import { browser } from '$app/environment';
 import Icon from '@iconify/svelte';
 
 export let env = '';
 if (browser) {
     env = location.host === 'bridge.evm.eosnetwork.com' ? 'MAINNET' : 'TESTNET';
 }
</script>

<header class="flex flex-row justify-between items-center p-5">
    <div class="logo flex flex-row items-center">
        <img src="/eos_evm_{env === 'TESTNET' ? 'testnet_' : ''}logo.svg" alt="EOS EVM Logo" style="filter:invert(1); height: 45px;"/>
        <p class="ml-5 cursor-pointer text-gray-400">Switch Network</p>
    </div>
    <div class="flex flex-row items-center">
        <div class="about">
            <span class="pr-3 text-grey cursor-pointer text-gray-400">Docs</span>
            <span class="pr-5 text-grey cursor-pointer text-gray-400">FAQ</span>
        </div>
        <div class="connect-wallet flex flex-row">
            <p class="b-white border rounded-lg py-2 px-4">Connect Wallet</p>
        </div>
    </div>
</header>

<div class="router h-fit p-5"><span>ro5ruter</span></div>

<footer class="p-5">
    <nav class="flex flex-row justify-between items-center h-20 pb-5">
        <p class="text-sm w-1/2">&copy; 2023 EOS Network Foundation. All rights reserved.</p>
        <!-- <div class="logo">
             <img src="/eos_evm_{env === 'TESTNET' ? 'testnet_' : ''}logo.svg" alt="EOS EVM Logo" style="filter:invert(1); height: 45px;"/>
             </div> -->
        <div class="about-socials flex flex-row">
            
            <div class="socials flex flex-row justify-around">
                <Icon class="mx-3" icon="bi:twitter" color="white" width="22" height="22" />
                <Icon class="mx-3" icon="bi:discord" color="white" width="22" height="22" />
                <Icon class="mx-3" icon="bi:telegram" color="white" width="22" height="22" />
                <Icon class="mx-3" icon="bi:youtube" color="white" width="22" height="22" />
            </div>
        </div>
    </nav>
</footer>
