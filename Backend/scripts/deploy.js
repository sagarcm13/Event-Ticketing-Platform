const hardhat = require('hardhat');
const { ethers } = require('hardhat');

async function main() {
    const TicketChain = await ethers.getContractFactory("TicketChain");
    console.log('Deploying TicketChain...');
    const ticketChain = await TicketChain.deploy();

    // Wait for deployment to complete before accessing the address
    await ticketChain.waitForDeployment();

    console.log("TicketChain deployed to:",await ticketChain.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
