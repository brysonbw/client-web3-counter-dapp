import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    LedgerWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import idl from './idl.json'
import * as anchor from '@project-serum/anchor';
import React, { FC, ReactNode, useMemo } from 'react';
import Heading from './components/Heading';
require('./index.css');
require('@solana/wallet-adapter-react-ui/styles.css');

const { SystemProgram, Keypair } = anchor.web3;
// generate random keypair for account initialization
const baseAccount = Keypair.generate();
const programID = new PublicKey(idl.metadata.address);


// -------App
const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};
export default App;

//------solana wallet -> context
const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;
    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // solana wallet adapter wallets
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new SolletWalletAdapter({ network }),
            new SolletExtensionWalletAdapter({ network }),
        ],
        [network]
    );
// return wallet button
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// ------------Content
const Content: FC = () => {
    const [value, setValue] = React.useState(null);
    const wallet = useAnchorWallet()

    // creating the provider
    async function getProvider() {
        if (!wallet) {
            return null
        }
        /* network set to local network for now */
        const network = 'https://api.devnet.solana.com'
        const connection = new Connection(network, 'processed');
        const provider = new anchor.AnchorProvider(
            connection, wallet, {"preflightCommitment": "processed"},
          );
          return provider;
      }

      // -----------initialize/create the counter account
      async function createCounter() {    
        const provider = await getProvider()
        if (!provider) {
           throw new Error("Provider is null");
        }
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new anchor.Program(b, programID, provider);
        try {
          // program via rpc 
          await program.rpc.initialize({
            accounts: {
              myAccount: baseAccount.publicKey,
              user: provider.wallet.publicKey,
              systemProgram: SystemProgram.programId,
            },
            signers: [baseAccount]
          });
    
          const account = await program.account.myAccount.fetch(baseAccount.publicKey);
          // console.log('account: ', account);
          setValue(account.count.toString());
        } catch (err) {
          console.log("Transaction error: ", err);
        }
      }

      //---- increment the counter 
      async function increment() {
        const provider = await getProvider()
        if (!provider) {
           throw new Error("Provider is null");
        }
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new anchor.Program(b, programID, provider);
        await program.rpc.increment({
          accounts: {
           myAccount: baseAccount.publicKey
          }
        });
    
        const account = await program.account.myAccount.fetch(baseAccount.publicKey);
        // console.log('account: ', account);
        setValue(account.count.toString());
      }


       //----decrement the counter 
       async function decrement() {
        const provider = await getProvider()
        if (!provider) {
           throw new Error("Provider is null");
        }
        const a = JSON.stringify(idl)
        const b = JSON.parse(a)
        const program = new anchor.Program(b, programID, provider);
        await program.rpc.decrement({
          accounts: {
           myAccount: baseAccount.publicKey
          }
        });
    
        const account = await program.account.myAccount.fetch(baseAccount.publicKey);
       // console.log('account: ', account);
        setValue(account.count.toString());
      }


      if (!wallet) {
        // if the user's wallet is not connected, display connect wallet button
        return (
          <div className='App'>
              <Heading />
            <WalletMultiButton />
          </div>
        )
      } else {
          // return counter start, increment, decrement
          return (
            <div className="App">
            <Heading />
            <div>
          {
            !value && (<button className='btnCreate'
                onClick={createCounter}>Create Counter</button>)
          }
          {
            value &&  <button
                className='btn'
             onClick={increment}>Increment</button>
          }

            {
            value &&  <button className='btn'
            onClick={decrement}>Decrement</button>
            }

          {
            value && value >= Number(0) ?  
              <h2 style={{textAlign: 'center', color: 'white'}}>{value}</h2> : undefined }
        </div>
        <WalletMultiButton />
        </div>
          )
      }
};
