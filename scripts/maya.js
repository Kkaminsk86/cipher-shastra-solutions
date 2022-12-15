const { ethers } = require("hardhat");
const { expect } = require("chai");

async function getContracts(buyer) {
  const Maya = await ethers.getContractFactory("Maya", buyer);
  const MERC20 = await ethers.getContractFactory("MERC20", buyer);
  // Maya contract address (on goerli network): 0xA65d0E85BB136F460d864a8D37EacC1011314623
  const maya = Maya.attach("0xA65d0E85BB136F460d864a8D37EacC1011314623");
  const merc20Address = await maya.token();
  const merc20 = MERC20.attach(merc20Address);
  return [maya, merc20];
}

async function main() {
  let [buyer] = await ethers.getSigners();
  let [maya, merc20] = await getContracts(buyer);

  console.log(
    "\n Getting required MERC20 tokens for purchase 1 Maya ERC721 token... \n"
  );
  await merc20.getTokens();
  const buyerBal = await merc20.balanceOf(buyer.address);
  expect(buyerBal).to.equal(500n * 10n ** 18n);
  expect(buyerBal).to.equal(await maya.price());

  console.log("Approving Maya contract to spend buyer MERC20 tokens... \n");
  await merc20.approve(maya.address, buyerBal);
  const mayaAllowance = await merc20.allowance(buyer.address, maya.address);
  expect(mayaAllowance).to.equal(buyerBal);

  // Estimated gas amount required for one buy() function call
  const gasAmount = await maya.estimateGas.buy();
  console.log(
    "Estimated gas amount required for calling buy() function:",
    gasAmount.toNumber(),
    "\n"
  );

  const mayaBalanceBefore = (await maya.balanceOf(buyer.address)).toString();
  const merc20BalanceBefore = (
    await merc20.balanceOf(buyer.address)
  ).toString();
  console.log(
    "Currently buyer have",
    mayaBalanceBefore,
    "MAYA tokens and",
    merc20BalanceBefore,
    "MERC20 tokens \n"
  );
  console.log("Buying 3 Maya tokens for price of one... \n");
  await maya.buy({ gasLimit: 144577 });
  // Manually selected gas amount which is 30000 units smaller from above estimated gas amount
  await maya.buy({ gasLimit: 114550 });
  await maya.buy({ gasLimit: 114550 });

  const mayaBalanceAfter = (await maya.balanceOf(buyer.address)).toString();
  const merc20BalanceAfter = (await merc20.balanceOf(buyer.address)).toString();
  console.log("Congratulations!", await maya.hunter(), "\n");
  console.log(
    "Buyer now have",
    mayaBalanceAfter,
    "MAYA tokens and",
    merc20BalanceAfter,
    "MERC20 tokens \n"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
