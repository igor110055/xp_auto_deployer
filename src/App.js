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

  //const providerUrl = "http://127.0.0.1:8545"

  const [contract, setContract] = useState(xpnftjson)
  const [contractName, setContractName] = useState("xpnft")
  //const [chainName, setChainName] = useState("")
  const [chain, setChain] = useState("")
  const [addressMsg, setMsg] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [baseURI, setBaseURI] = useState("")
  const [chainNames, setChainNames] = useState([])


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





  const handleSubmit = async (event) => {
    try{
    event.preventDefault()
    console.log("deploying your contract")

    let provider = window.ethereum

    const accounts = await provider.request({ method: "eth_requestAccounts" })

    let i = 0;
    let network;
    for (; i < chains.length; i++) {
      if ((chains[i]).name == chain.label) {
        network = chains[i]
      }
    }

    console.log("network is: ", network)

    const web3 = new Web3(network.rpc[0])

    //const rpcUrl = "http://127.0.0.1:8545" //((chains[i])["url"])[0]
    const abi = contract.abi

    //console.log("rpcUrl is: ", rpcUrl)
    console.log("abi is: ", abi)



    const myContract = new web3.eth.Contract(abi)

    console.log("contract is: ", myContract)

    //console.log(myContract)

    console.log("accounts[0] is: ", accounts[0])

    const result = await myContract.deploy({ data: contract.data.bytecode.object, arguments: [tokenName, tokenSymbol, baseURI] })
      .send({ from: accounts[0] })

    console.log("my result is: ", result)

    console.log("contract deployed to:", result._address);
    setMsg(`contract deployed to: ${result._address} `)

  }catch(error){
    console.log("error in handleSubmit is: ",error)
    setMsg("error in handleSubmit is: ",error)
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
  window.ethereum.on('chainChanged', () => {
    window.location.reload();
  })
  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  })
  //#endregion

  return (
    <div className="App">
      <h1>XPNFT deployer</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter token name: </label>
        <input type={"text"} value={tokenName} placeholder="exampleToken" onChange={(e) => { setTokenName(e.target.value) }} />
        <br />
        <br />
        <label>Enter token symbol </label>
        <input type={"text"} value={tokenSymbol} placeholder="SYM" onChange={(e) => { setTokenSymbol(e.target.value) }} />
        <br />
        <br />
        <label>Enter base URI </label>
        <input type={"text"} value={baseURI} placeholder="http://something.com" onChange={(e) => { setBaseURI(e.target.value) }} />
        <br />
        <br />
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={chainNames}
          onChange={(event, newValue) => {
            setChain(newValue);
          }}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="chains" />}
        />
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
  