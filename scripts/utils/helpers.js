const { ethers } = require("hardhat");

function findSalt(address, byteCode, want) {
  // Params preparation for calculation: keccak256(0xff ++ deployingAddr ++ salt ++ keccak256(bytecode))[12:]
  const constant = "0xff";
  const deployingAddr = address.slice(2);
  const byteCodeHash = ethers.utils.keccak256(byteCode).slice(2);
  // Salts to test
  const maxSalt = ethers.BigNumber.from(2).pow(53);

  for (let i = 0; i < maxSalt; i++) {
    const saltToBytes = ethers.utils
      .hexZeroPad(ethers.utils.hexlify(i), 32)
      .slice(2);
    const concatParams = constant
      .concat(deployingAddr)
      .concat(saltToBytes)
      .concat(byteCodeHash);
    const hash = ethers.utils.keccak256(concatParams);
    if (hash.substring(26).toLowerCase().includes(want)) {
      return "0x" + saltToBytes;
    }
  }
}

module.exports = { findSalt };
