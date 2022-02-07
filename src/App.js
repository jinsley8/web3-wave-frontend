import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import './App.css';
import { BallTriangle } from 'react-loading-icons';

const App = () => {

  /* store our user's public wallet in state */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");

  // const [resourceCount, setResourceCount] = useState();
  // const [resourceAddress, setResourceAddress] = useState();
  // const [isConnecting, setConnecting] = useState(false);
  // const [isLoading, setLoading] = useState(false);
  const [isMining, setMining] = useState(false);

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = abi.abi;

  /*
   * Create a method that gets all waves from the contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from the Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();

        /*
         * Only need address, timestamp, and message in our UI
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask (https://metamask.io/download/)");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask! (https://metamask.io/download/)");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  /** Wave() and getTotalWaves() from smart contract **/
  const submitWave = async (e) => {
    e.preventDefault();
    console.log(message);

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        setMessage("")
        setMining(true);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        setMining(false);
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  /* eslint-disable */
  useEffect(() => {
    getAllWaves();
  }, [allWaves]);
  /* eslint-enable */

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <h1><span role="img" aria-label="Wave emoji">👋</span> Wave Portal</h1>
        </div>

        <div className="bio">
          Connect your Ethereum wallet and wave at me!
        </div>

        {/** If there is no currentAccount render this button **/}
        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
          <>
            <div className="walletAddress">
              {currentAccount}
            </div>

            <form className="form" onSubmit={submitWave}>
              <input className="form__input" value={message} onChange={(e) => setMessage(e.target.value)} type="text" placeholder="Leave a message..."/>
              <input className="form__waveButton" type="submit" value="Wave 👋" />
            </form>

            <h2>Waves</h2>
            {allWaves.map((wave, index) => {
              return (
                <div key={index} className="message">
                  <h4 className="message__address">{wave.address}</h4>
                  <p className="message__time">{wave.timestamp.toLocaleString('en-US', { timeZone: 'EST' })}</p>
                  <p className="message__text">{wave.message}</p>
                </div>)
            })}

            {isMining && (
              <div className="miningText">
                <BallTriangle stroke="#cf1980" speed={.75} />
                <span>Hold on, we're mining a new message...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App