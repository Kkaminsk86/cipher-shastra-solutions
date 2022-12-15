const { ethers } = require("hardhat");
const { findSalt } = require("./utils/helpers.js");

async function main() {
  const UndeadFactory = await ethers.getContractFactory("undead");
  const undeadInstance = await UndeadFactory.attach(
    "0xd43678eb793a9b8847ee270900b03e61eadec786"
  );

  const SolutionFactory = await ethers.getContractFactory("UndeadSolution");
  const solutionInstance = await SolutionFactory.deploy();

  // Value that is required to be in the Mortal contract address
  const want = ethers.utils.hexStripZeros(await undeadInstance.want()).slice(2);
  // Init bytecode + runtime bytecode
  const mortalMinBytecode =
    "0x600f600c600039600f6000f365556e4465414460805260206080f3";
  console.log("Start searching for a matching salt....");
  const salt = findSalt(solutionInstance.address, mortalMinBytecode, want);

  console.log("Search finished. Found salt:", salt);
  console.log("Deploying Mortal contract with bytecode and salt...");
  await solutionInstance.deploy(salt);
  const deployedMortalAddr = await solutionInstance.mortalAddr();
  console.log("Mortal contract deployed to address:", deployedMortalAddr);

  await undeadInstance.deadOrAlive(deployedMortalAddr);
  const mortalAddrToBytes = ethers.utils.keccak256(deployedMortalAddr);
  const isUndead = await undeadInstance.UnDeAD(mortalAddrToBytes);
  if (isUndead) {
    console.log("Excellent! Mortal has become immortal :)");
  } else {
    console.log("Try again. :(");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
