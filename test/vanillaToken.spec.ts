import chai, { expect } from 'chai'
import { Contract } from 'ethers'
import { MaxUint256 } from '@ethersproject/constants' //use @ethersproject/ instead of ethers when using OVM
import { BigNumber} from '@ethersproject/bignumber' //use @ethersproject/ instead of ethers when using OVM
import { defaultAbiCoder} from '@ethersproject/abi' //use @ethersproject/ instead of ethers when using OVM
import { hexlify } from '@ethersproject/bytes' //use @ethersproject/ instead of ethers when using OVM
import { keccak256 } from '@ethersproject/keccak256' //use @ethersproject/ instead of ethers when using OVM
import {toUtf8Bytes } from '@ethersproject/strings' //use @ethersproject/ instead of ethers when using OVM
import { solidity, deployContract } from 'ethereum-waffle'
import { provider } from './shared/config'
import { ecsign } from 'ethereumjs-util'
import { expandTo18Decimals, getApprovalDigest } from './shared/utilities'
import vanillaToken from '../build/Token.json'

chai.use(solidity)

//const name = 'vanillaToken'
const TOTAL_SUPPLY = expandTo18Decimals(10000)
const TEST_AMOUNT = expandTo18Decimals(10)

describe('vanillaToken' , () => {

	const [wallet, other] = provider.getWallets()

	let token: Contract
	beforeEach(async () => {
		token = await deployContract(wallet, vanillaToken)
	})

	it('basics info', async () => {
		expect(await token.name()).to.eq('Vanilla Token')
		expect(await token.symbol()).to.eq('VTN')
		expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY)
		expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY)
	})

	it('approve', async () => {
		await expect(token.approve(other.address, TEST_AMOUNT))
		.to.emit(token, 'Approval')
		.withArgs(wallet.address, other.address, TEST_AMOUNT)
		expect(await token.allowance(wallet.address, other.address)).to.eq(TEST_AMOUNT)
	})

	it('transfer', async () => {
		await expect(token.transfer(other.address, TEST_AMOUNT))
		.to.emit(token, 'Transfer')
		.withArgs(wallet.address, other.address, TEST_AMOUNT)
		expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
		expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
	})

	it('transfer: fail', async () => {
		await expect(token.transfer(other.address, TOTAL_SUPPLY.add(1))).to.be.reverted
		await expect(token.connect(other).transfer(wallet.address, 1)).to.be.reverted
	})

	it('transferFrom', async () => {
		await token.approve(other.address, TEST_AMOUNT)
		await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
		.to.emit(token, 'Transfer')
		.withArgs(wallet.address, other.address, TEST_AMOUNT)
		expect(await token.allowance(wallet.address, other.address)).to.eq(0)
		expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
		expect(await token.balanceOf(other.address)).to.eq (TEST_AMOUNT)
	})

	it('transferFrom:max', async () => {
		await token.approve(other.address, MaxUint256)
		await expect(token.connect(other).transferFrom(wallet.address, other.address, TEST_AMOUNT))
			.to.emit(token, 'Transfer')
			.withArgs(wallet.address, other.address, TEST_AMOUNT)
		expect(await token.allowance(wallet.address, other.address)).to.eq(MaxUint256.sub(TEST_AMOUNT))
		expect(await token.balanceOf(wallet.address)).to.eq(TOTAL_SUPPLY.sub(TEST_AMOUNT))
		expect(await token.balanceOf(other.address)).to.eq(TEST_AMOUNT)
	})

})


















