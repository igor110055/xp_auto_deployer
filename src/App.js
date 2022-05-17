import react, { useState, useEffect } from 'react'
import logo from './logo.svg';
import './App.css';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Web3 from 'web3'
import chains from './chains_data/chains.json'
import xpnftjson from './abis/xpnft.json'
import bridgenftjson from './abis/bridgenft.json'

const contracts = ["xpnft", "bridgenft"]
function App() {

  const [contract, setContract] = useState(xpnftjson)
  const [contractName, setContractName] = useState("xpnft")
  //const [chainName, setChainName] = useState("")
  const [chain, setChain] = useState("")
  const [addressMsg, setMsg] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [baseURI, setBaseURI] = useState("")
  const [chainNames, setChainNames] = useState([])
  const [RpcURL, setRpcUrl] = useState("")
  const [txtVisible, setTXTVisible] = useState("none")
  const [autoCompleteVis, setAutoCompleteVis] = useState("block")
  const [buttonVis, setButtonVis] = useState("none")


  useEffect(() => {

    const getChainNames = () => {
      const chainNames = chains.map((item, index) => {
        return ({
          label: item.name,
          id: item.chainId
        })
      })
      setChainNames(chainNames)
    }

    getChainNames()

  }, [])


  const getNetworkDetails = (chainName) => {
    let i = 0;
    let network;
    for (; i < chains.length; i++) {
      if ((chains[i]).name == chain.label) {
        network = chains[i]
        break
      }
    }
    return network
  }


  const handleSubmit = async (event) => {
    try {
      event.preventDefault()
      console.log("deploying your contract")

      const provider = window.ethereum
      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const network = getNetworkDetails(chain)
      console.log("network is: ", network)
      const web3 = new Web3(provider)
      const abi = contract.abi
      const myContract = new web3.eth.Contract(abi)

      const result = await myContract.deploy({ data: contract.data.bytecode.object, arguments: [tokenName, tokenSymbol, baseURI] })
        .send({ from: accounts[0] })

      console.log("contract deployed to:", result._address);
      setMsg(`contract deployed to: ${result._address} `)

    } catch (error) {
      console.log("error in handleSubmit is: ", error)
      setMsg("error in handleSubmit is: ", error)
    }
  }

  const changeContract = (name) => {
    if (name == "xpnft") {
      setContract(xpnftjson)
      setContractName("xpnft")
      return
    }
    if (name == "bridgenft") {
      setContract(bridgenftjson)
      setContractName("bridgenft")
      return
    }
  }

  //#region Event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      })
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
      })
    }
  })

  const changeNetwork = async () => {
    if (chain != "") {

      //wallet_addEthereumChain

      const chainDetails = getNetworkDetails(chain)
      const hexChainId = Web3.utils.numberToHex(chainDetails.chainId)
      console.log("new chain id is: ", hexChainId)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        if (txtVisible == "none") {
          setTXTVisible("inline")
          setAutoCompleteVis("none")
          setButtonVis("block")
          console.log("reloading...")


        }
        /*if(txtVisible=="inline")
        {
          
        }*/
      }

    }
  }

  const addNetwork = async () => {
    const chainDetails = getNetworkDetails(chain)
    const hexChainId = Web3.utils.numberToHex(chainDetails.chainId)
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: hexChainId,
          chainName: chainDetails.name,
          rpcUrls: [RpcURL]
        },
      ]
    })
  }

  useEffect(() => {
    changeNetwork()
  }, [chain])
  //#endregion
  return (
    <div className="App">
      <h1>XPNFT deployer</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter token name: </label>
        <input type={"text"} value={tokenName} required placeholder="exampleToken" onChange={(e) => { setTokenName(e.target.value) }} />
        <br />
        <br />
        <label>Enter token symbol </label>
        <input type={"text"} value={tokenSymbol} required placeholder="SYM" onChange={(e) => { setTokenSymbol(e.target.value) }} />
        <br />
        <br />
        <label>Enter base URI </label>
        <input type={"text"} value={baseURI} required placeholder="http://something.com" onChange={(e) => { setBaseURI(e.target.value) }} />
        <br />
        <br />
        <Autocomplete
          style={{ display: autoCompleteVis }}
          disablePortal
          id="combo-box-demo"
          options={chainNames}
          onChange={(event, newValue) => {
            setChain(newValue);
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="chains" />}
        />
        <div style={{ display: txtVisible }}>
          <text >It looks like you're trying to deploy to a network you don't have in your wallet</text>
          <br />
          <text> please add its RPC URL and click to add the network: </text>
          <br />
          <input type={"text"} value={RpcURL} onChange={(e) => {setRpcUrl(e.target.value) }} />
          <br />
          <br />
          <button type='button' style={{ display: buttonVis }} onClick={addNetwork} >{`Add ${chain.label} to MetaMask`}</button>
        </div>
        <br />
        <button type="submit" >Deploy</button>
      </form>
      <text>{addressMsg}</text>

    </div>
  );
}

export default App;

/**
 * <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={contracts}
          value={contractName}
          key={contractName}
          onChange={(event, newValue) => {
            changeContract(newValue);
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} key={contractName} label="Contracts" />}
        />
 */


/*onInputChange={(event,newValue)=>{
  setChainName(newValue)
}}*/
