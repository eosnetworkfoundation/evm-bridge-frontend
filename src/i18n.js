import { createI18n } from 'vue-i18n'
const messages = {
  en: {
    'home.withdraw': 'Withdraw',
    'home.deposit': 'Deposit',
    'home.from': 'From',
    'home.to': 'To',
    'home.address': 'Address',
    'home.connecting': 'Connecting',
    'home.connected': 'Connected',
    'home.connectWallet': 'Connect Wallet',
    'home.amount': 'Amount',
    'home.myBalance': 'My balance:',
    'home.insufficient': 'You don\'t have enough balance',
    'home.destinationAccount': 'Destination Account',
    'home.destinationAccountDesc': 'Please paste the EOS Address below:',
    'home.destinationAccountDescCopy': 'Please use the EOS Address below:',
    'home.memoLabel': 'Memo (optional)',
    'home.memoTooltip': 'Please confirm if the receiving address requires a memo / Tag.\nIf it is not filled or filled incorrectly, the asset will be lost.',
    'home.transferOngoing': 'Transfer ongoing...',
    'home.transferSuccess': 'Success!',
    'home.transfer': 'Transfer',
    'home.gasFee': 'Gas Fee: ',
    'home.transferTime': 'Time to transfer: {0}',
    'home.exchangeTime': 'Time to exchange: {0}',
    'home.lastTransaction': 'Last transaction:',
    'home.copy': 'Copy',
    'home.addrCopied' : 'Address copied',
    'home.bridgeFee': 'Bridge Fee:',
    'home.depositDesc': 'Send the transaction and it\'s done!',
    'home.depositMemoLabel': 'Transfer memo / Destination Tag',
    'home.addressTitle': 'Please use the destination EVM address:',
    'home.connectEvmWallet': 'Connect EVM wallet',
    'home.addressDesc': '{0} to display your address.',

    'home.netWarning.testnet': 'Warning! This is the TESTNET.',
    'home.netWarning.mainnet': 'Warning! This is the MAINNET.',
    'home.netWarning.desc': 'Please confirm that your wallet is connected to the correct network before making a transfer. Using the wrong network may result in potential loss of assets.',
    'home.eos2evmDesc.p1': 'Please use a wallet that supports the EOS Network, such as Anchor, Wombat, Tokenpocket or a centralized exchange such as Binance, Coinbase, etc.',
    'home.eos2evmDesc.p2': 'To transfer funds to the following EOS contract address, please fill in the EVM destination address in the memo to complete the deposit to EVM.',

    'home.addressCheck.invalidAddress': 'Address include illegal character',
    'home.addressCheck.invalid13Char': 'Invalid 13th character',

    'home.cexNotSupported' : 'This CEX has not fully support the EOS-EVM bridge yet.',

    'home.swtichNetPrompt' : 'You must switch to correct network to continue.',
    'home.addNetPrompt' : 'Please add the EOS-EVM Network to MetaMask.',

    'home.transferConfirm' : 'You are going to transfer {0} EOS to {1}',

    'navbar.about': 'About',
    'navbar.docs': 'Docs',
    'navbar.faq': 'FAQ',
    'footer.copyright': '© 2023 EOS Network Foundation all rights reserved.'
  },
  ko: {
    'home.withdraw': '철회하다',
    'home.deposit': '보증금',
    'home.from': '에서',
    'home.to': '에게',
    'home.address': '주소',
    'home.connecting': '연결하다',
    'home.connected': '연결',
    'home.connectWallet': '지갑 연결',
    'home.amount': '양',
    'home.myBalance': '나의 잔액:',
    'home.insufficient': '잔고가 충분하지 않습니다',
    'home.destinationAccount': '대상 계정',
    'home.destinationAccountDesc': '아래에 EOS 주소를 붙여넣으세요:',
    'home.destinationAccountDescCopy': '아래의 EOS 주소를 사용하세요:',
    'home.memoLabel': '메모(선택)',
    'home.memoTooltip': '수취인 주소에 메모/태그가 필요한지 확인해주세요.\n미기재 또는 오기재시 자산이 소멸됩니다.',
    'home.transferOngoing': '전송 진행 중...',
    'home.transferSuccess': '성공!',
    'home.transfer': '옮기다',
    'home.gasFee': '가스 요금: ',
    'home.transferTime': '전송 시간: {0}',
    'home.exchangeTime': '교환 시간: {0}',
    'home.lastTransaction': '마지막 거래:',
    'home.copy': '복사',
    'home.bridgeFee': '브릿지 수수료:',
    'home.depositDesc': '거래를 보내면 완료됩니다!',
    'home.addressTitle': '대상 EVM 주소를 사용하십시오:',
    'home.connectEvmWallet': 'EVM 지갑 연결',
    'home.addressDesc': '{0} 주소를 표시합니다.',
    'home.depositMemoLabel': '전송 메모 / 목적지 태그',

    'navbar.about': '에 대한',
    'navbar.docs': '문서',
    'navbar.faq': '자주하는 질문',
    'footer.copyright': '© 2023 EOS 네트워크 재단 all rights reserved.'
  }
}
export default createI18n({
  messages,
  globalInjection: true,
  legacy: false,
  locale: localStorage.locale || 'en',
  fallbackLocale: 'en'
})
