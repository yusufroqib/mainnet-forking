import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function main() {
	const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
	const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
	const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
	const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

	const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

	await helpers.impersonateAccount(TOKEN_HOLDER);
	const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

	const amountOut = ethers.parseUnits("1", 18);
	const amountInMax = ethers.parseUnits("3000", 6);

	const USDC_Contract = await ethers.getContractAt(
		"IERC20",
		USDC,
		impersonatedSigner
	);

	const DAI_Contract = await ethers.getContractAt(
		"IERC20",
		DAI,
		impersonatedSigner
	);

	const WETH_Contract = await ethers.getContractAt(
		"IERC20",
		WETH,
		impersonatedSigner
	);

	const ROUTER = await ethers.getContractAt(
		"IUniswapV2Router",
		ROUTER_ADDRESS,
		impersonatedSigner
	);



	

	//*******************************************************SWAP TOKENS FOR EXACT ETH****************************************************************************************
	console.log(
		"=====================******==SWAP TOKENS FOR EXACT ETH==******====================="
	);
	const approveTx = await USDC_Contract.approve(ROUTER_ADDRESS, amountInMax);
	await approveTx.wait();

	const deadline3 = Math.floor(Date.now() / 1000) + 60 * 10;

	// const WETHBalBefore = await WETH_Contract.balanceOf(TOKEN_HOLDER);
	// console.log({ WETHBalBefore });

	const ETHERSBALANCEBEFORESWAP = await ethers.provider.getBalance(
		TOKEN_HOLDER
	);
	console.log({
		ETHERSBALANCEBEFORESWAP: ethers.formatUnits(
			ETHERSBALANCEBEFORESWAP.toString(),
			18
		),
	});
	const txRes = await ROUTER.swapTokensForExactETH(
		amountOut,
		amountInMax,
		[USDC, WETH],
		TOKEN_HOLDER,
		deadline3
	);
	await txRes.wait();

	const ETHERSBALANCEAFTERSWAP = await ethers.provider.getBalance(TOKEN_HOLDER);
	console.log({
		ETHERSBALANCEAFTERSWAP: ethers.formatUnits(
			ETHERSBALANCEAFTERSWAP.toString(),
			18
		),
	});

	const WETHBalAfter = await WETH_Contract.balanceOf(TOKEN_HOLDER);
	console.log({ WETHBalAfter });





	//*******************************************************SWAP TOKENS FOR EXACT TOKENS****************************************************************************************
	console.log(
		"=====================******==SWAP TOKENS FOR EXACT TOKENS==******====================="
	);

	await USDC_Contract.approve(ROUTER, amountOut);

	const usdcBal = await USDC_Contract.balanceOf(impersonatedSigner.address);
	const daiBal = await DAI_Contract.balanceOf(impersonatedSigner.address);
	const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

	console.log("usdc balance before swap", Number(usdcBal));
	console.log("dai balance before swap", Number(daiBal));

	await ROUTER.swapTokensForExactTokens(
		amountOut,
		amountInMax,
		[USDC, DAI],
		impersonatedSigner.address,
		deadline
	);

	const usdcBalAfter = await USDC_Contract.balanceOf(
		impersonatedSigner.address
	);
	const daiBalAfter = await DAI_Contract.balanceOf(impersonatedSigner.address);

	console.log("=========================================================");

	console.log("usdc balance after swap", Number(usdcBalAfter));
	console.log("dai balance after swap", Number(daiBalAfter));






	//*******************************************************ADD LIQUIDITY****************************************************************************************

	console.log(
		"=====================******==ADD LIQUIDITY==******====================="
	);

	const usdcBalBefore = await USDC_Contract.balanceOf(
		impersonatedSigner.address
	);
	const daiBalBefore = await DAI_Contract.balanceOf(impersonatedSigner.address);
	const deadline2 = Math.floor(Date.now() / 1000) + 60 * 10;
	const amountADesired = ethers.parseUnits("1000", 6);
	const amountBDesired = ethers.parseUnits("1000", 18);
	const amountAMin = ethers.parseUnits("90", 6);
	const amountBMin = ethers.parseUnits("90", 18);
	const to = impersonatedSigner.address;

	await USDC_Contract.approve(ROUTER.getAddress(), amountADesired);
	await DAI_Contract.approve(ROUTER.getAddress(), amountBDesired);

	console.log({ usdcBalBefore }, { daiBalBefore });
	console.log("=========================================================");

	const txResponse = await ROUTER.addLiquidity(
		USDC,
		DAI,
		amountADesired,
		amountBDesired,
		amountAMin,
		amountBMin,
		to,
		deadline2
	);
	const txReceipt = await txResponse.wait();
	// console.log(txReceipt?.logs);

	const [amountA, amountB, liquidity]: any = txReceipt?.logs[0].topics;

	console.log("Amount A:", ethers.formatUnits(amountA, 6));
	console.log("Amount B:", ethers.formatUnits(amountB, 18));
	console.log("Liquidity:", ethers.formatUnits(liquidity, 18));

	// console.log(result);

	const usdcBalAfterAddLiquidity = await USDC_Contract.balanceOf(
		impersonatedSigner.address
	);
	const daiBalAfterAddLiquidity = await DAI_Contract.balanceOf(
		impersonatedSigner.address
	);
	console.log({ usdcBalAfterAddLiquidity }, { daiBalAfterAddLiquidity });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
