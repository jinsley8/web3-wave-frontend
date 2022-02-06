import * as React from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {

  const wave = () => {

  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Wave Portal
        </div>

        <div className="bio">
          Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave
        </button>
      </div>
    </div>
  );
}
