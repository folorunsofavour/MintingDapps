import { utils, BigNumber } from 'ethers';
import React from 'react';
import NetworkConfigInterface from '../../../../smart-contract/lib/NetworkConfigInterface';

interface Props {
  networkConfig: NetworkConfigInterface;
  maxSupply: number;
  totalSupply: number;
  tokenPrice: BigNumber;
  maxMintAmountPerTx: number;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  //changes made
  mintTokens(mintAmount: number): Promise<boolean>;
  whitelistMintTokens(mintAmount: number): Promise<boolean>; 
  
}

// interface State {
//   mintAmount: number;
// }

// const defaultState: State = {
//   mintAmount: 1,
// };
//changes made
interface State {
  mintAmount: number;
  success: boolean
}

const defaultState: State = {
  mintAmount: 1,
  success: false
};

export default class MintWidget extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  private canMint(): boolean {
    return !this.props.isPaused || this.canWhitelistMint();
  }

  private canWhitelistMint(): boolean {
    return this.props.isWhitelistMintEnabled && this.props.isUserInWhitelist;
  }

  private incrementMintAmount(): void {
    this.setState({
      mintAmount: Math.min(this.props.maxMintAmountPerTx, this.state.mintAmount + 1),
    });
  }

  private decrementMintAmount(): void {
    this.setState({
      mintAmount: Math.max(1, this.state.mintAmount - 1),
    });
  }

  // private timeOut(): void {
  //   this.setState({success: false});
  // }
  // var myFunction = function(){
  //   this.setState({success: false});
  // };

  // private async mint(): Promise<void> {
  //   if (!this.props.isPaused) {
  //     await this.props.mintTokens(this.state.mintAmount);

  //     return;
  //   }

  //   await this.props.whitelistMintTokens(this.state.mintAmount);
  // }
//changes made
  private async mint(): Promise<void> {

    if (!this.props.isPaused) {
      // await this.props.mintTokens(this.state.mintAmount);
      const response = await this.props.mintTokens(this.state.mintAmount);
      this.setState({success: response});
      // setTimeout(this.timeOut, 10000);
      setTimeout(() => {
        this.setState({success: false});
      }, 10000);
      return;
    }

    const responce = await this.props.whitelistMintTokens(this.state.mintAmount);
    
    this.setState({success: responce});
    setTimeout(() => {
      this.setState({success: false});
    }, 10000);
    // setTimeout(this.timeOut, 10000);
  }

  render() {
    return (
      <>
        {this.canMint() ?
          <div className="mint-widget">
            <div className="preview">
              <img src="/build/images/preview.png" alt="Collection preview" />
            </div>

            <div className="price">
              <strong>Total price:</strong> {utils.formatEther(this.props.tokenPrice.mul(this.state.mintAmount))} {this.props.networkConfig.symbol}
            </div>
            {/* //changes made */}
            {this.state.success ? <img className="overlay" src="/build/images/test.gif" alt="success gif"/> : "" }

            <div className="controls">
              <button className="decrease" onClick={() => this.decrementMintAmount()}>-</button>
              <span className="mint-amount">{this.state.mintAmount}</span>
              <button className="increase" onClick={() => this.incrementMintAmount()}>+</button>
              <button className="primary" onClick={() => this.mint()}>Mint</button>
            </div>
          </div>
          :
          <div className="cannot-mint">
            <span className="emoji">⏳</span>
            
            {this.props.isWhitelistMintEnabled ? <>You are not included in the <strong>whitelist</strong>.</> : <>The contract is <strong>paused</strong>.</>}<br />
            Please come back during the next sale!
          </div>
        }
      </>
    );
  }
}
