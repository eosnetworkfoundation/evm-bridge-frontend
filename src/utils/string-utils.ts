import BN from 'bn.js'

function charToSymbol(c: string): number {
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
  throw new Error('Address includes illegal character')
}

function strToUint64(str: string): string {
  var n = new BN(0)
  var i = str.length
  if (i >= 13) {
    // Only the first 12 characters can be full-range ([.1-5a-z]).
    i = 12

    // The 13th character must be in the range [.1-5a-j] because it needs to be encoded
    // using only four bits (64_bits - 5_bits_per_char * 12_chars).
    n = new BN(charToSymbol(str[12]));
    if (charToSymbol(str[12]) >= 16) {
      throw new Error('Invalid 13th character')
    }
  }
  // Encode full-range characters.

  while (--i >= 0) {
    n = n.or(new BN(charToSymbol(str[i])).shln((64 - 5 * (i + 1))))
  }
  return n.toString(16, 16)
}

function uint64ToAddr(str: string): string {
  return '0xbbbbbbbbbbbbbbbbbbbbbbbb' + str
}

function stringToUTF8Bytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToHexString(bytes: Uint8Array): string {
  return "0x" + Array.from(
    bytes,
    byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

function stringToHexString(str: string): string {
  return bytesToHexString(stringToUTF8Bytes(str));
}

function convertAddress(address: string): string {
  try {
    return uint64ToAddr(strToUint64(address));
  } catch (error) {
    console.error(error);
    return address;
  }
}

function truncateAddress(address: string, numberOfDigits = 4): string {
  if (numberOfDigits > Math.floor((address.length - 2) / 2)) return address;
  const preamble = address.slice(0, 2 + numberOfDigits);
  const suffix = address.slice(-numberOfDigits);

  return `${preamble}...${suffix}`;
}

export {
  charToSymbol,
  strToUint64,
  uint64ToAddr,
  stringToUTF8Bytes,
  bytesToHexString,
  stringToHexString,
  convertAddress,
  truncateAddress
};
