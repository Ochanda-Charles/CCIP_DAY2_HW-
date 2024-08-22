const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChain Name Service Tests", function () {

  let CCIPLocalSimulator, ccipLocalSimulator;
  let CrossChainNameServiceRegister, ccnsRegister;
  let CrossChainNameServiceReceiver, ccnsReceiver;
  let CrossChainNameServiceLookup, ccnsLookup;

  // Deploy contracts before each test
  beforeEach(async function () {
    // Deploy the CCIPLocalSimulator contract
    CCIPLocalSimulator = await ethers.getContractFactory("CCIPLocalSimulator");
    ccipLocalSimulator = await CCIPLocalSimulator.deploy();
    await ccipLocalSimulator.deployed();

    // Get Router address from the configuration() function
    const routerAddress = await ccipLocalSimulator.configuration();

    // Deploy the CrossChainNameServiceRegister contract
    CrossChainNameServiceRegister = await ethers.getContractFactory("CrossChainNameServiceRegister");
    ccnsRegister = await CrossChainNameServiceRegister.deploy(routerAddress);
    await ccnsRegister.deployed();

    // Deploy the CrossChainNameServiceReceiver contract
    CrossChainNameServiceReceiver = await ethers.getContractFactory("CrossChainNameServiceReceiver");
    ccnsReceiver = await CrossChainNameServiceReceiver.deploy(routerAddress);
    await ccnsReceiver.deployed();

    // Deploy the CrossChainNameServiceLookup contract
    CrossChainNameServiceLookup = await ethers.getContractFactory("CrossChainNameServiceLookup");
    ccnsLookup = await CrossChainNameServiceLookup.deploy();
    await ccnsLookup.deployed();

    // Enable chain in the Register and Receiver contracts
    await ccnsRegister.enableChain(1);  // Assuming chain ID 1
    await ccnsReceiver.enableChain(1);
  });

  // Test the register and lookup functions
  it("Should register and lookup a cross-chain name", async function () {
    const aliceAddress = "0xAliceAddress";  // Replace with actual address
    const name = "alice.ccns";

    // Set the CrossChainNameServiceAddress
    await ccnsLookup.setCrossChainNameServiceAddress("source", ccnsRegister.address);
    await ccnsLookup.setCrossChainNameServiceAddress("receiver", ccnsReceiver.address);

    // Register the name
    await ccnsRegister.register(name, aliceAddress);

    // Lookup the name
    const resolvedAddress = await ccnsLookup.lookup(name);

    // Assert the address matches
    expect(resolvedAddress).to.equal(aliceAddress);
  });

});
