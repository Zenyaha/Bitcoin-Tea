const bitcoin = require('bitcoinjs-lib');
const inquirer = require('inquirer');
const fs = require('fs-extra');

async function mainMenu() {
  const choices = [
    {
      name: 'Create wallet',
      value: 'createWallet',
    },
    {
      name: 'Send Bitcoin',
      value: 'sendBitcoin',
    },
    {
      name: 'View wallet balance',
      value: 'viewBalance',
    },
    {
      name: 'View wallet address',
      value: 'viewAddress',
    },
    {
      name: 'Exit',
      value: 'exit',
    },
  ];

  const answer = await inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'What do you want to do?',
    choices,
  });

  switch (answer.choice) {
    case 'createWallet':
      await createWallet();
      break;
    case 'sendBitcoin':
      await sendBitcoin();
      break;
    case 'viewBalance':
      await viewBalance();
      break;
    case 'viewAddress':
      await viewAddress();
      break;
    case 'exit':
      process.exit(0);
      break;
    default:
      console.error('Invalid choice.');
      break;
  }

  mainMenu();
}

async function createWallet() {
  // Generate a random 256-bit seed
  const seed = bitcoin.crypto.randomBytes(32);

  // Create a new wallet from the seed
  const wallet = bitcoin.Wallet.create(seed);

  // Get the public key and address of the wallet
  const publicKey = wallet.getPublicKey();
  const address = wallet.getAddress();

  console.log('Public Key:', publicKey.toString('hex'));
  console.log('Address:', address);

  // Save the wallet to a file
  const walletData = {
    seed: seed.toString('hex'),
    publicKey: publicKey.toString('hex'),
    address,
  };

  await fs.promises.writeFile('wallet.json', JSON.stringify(walletData));

  console.log('Wallet created and saved to wallet.json');
}

async function sendBitcoin() {
  // Prompt user for recipient address and amount
  const recipientAddress = await inquirer.prompt({
    type: 'input',
    name: 'recipientAddress',
    message: 'Enter the recipient address:',
  });

  const amount = await inquirer.prompt({
    type: 'number',
    name: 'amount',
    message: 'Enter the amount to send:',
  });

  // Load the wallet from file
  const walletData = await fs.promises.readFile('wallet.json');
  const wallet = bitcoin.Wallet.fromJSON(walletData);

  // Create a new transaction
  const transaction = new bitcoin.Transaction();

  // Add an input to the transaction
  transaction.addInput(prevTxHash, prevTxOutputIndex);

  // Add an output to the transaction
  transaction.addOutput(recipientAddress, amount);

  // Sign the transaction
  transaction.sign(wallet.getPrivateKey());

  // Broadcast the transaction to the network
  bitcoin.networks.testnet.broadcast(transaction.toBuffer());

  console.log('Transaction sent!');
}

async function viewBalance() {
  // Load the wallet from file
  const walletData = await fs.promises.readFile('wallet.json');
  const wallet = bitcoin.Wallet.fromJSON(walletData);

  // Get the balance of the wallet
  const balance = await wallet.getBalance();

  console.log('Your wallet balance is:', balance);
}

async function viewAddress() {
  // Load the wallet from file
  const walletData = await fs.promises.readFile
