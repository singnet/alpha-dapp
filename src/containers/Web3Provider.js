import { connect } from "react-redux"
import React, { Component } from "react"
import { setInjected } from "../actions/web3"
import { watchNetwork, stopWatchingNetwork } from "../helpers"

class Web3Provider extends Component {

  componentDidMount = () => {
    const { setInjected } = this.props

    setInjected(typeof window.web3 !== "undefined")

    if (typeof window.web3 !== "undefined") {
      watchNetwork()
    }
  }

  componentWillUnmount = () => stopWatchingNetwork()

  render = () => {
    const { web3 } = this.props

    if (!web3.injected) { return this.props.unavailableScreen }

    return this.props.children
  }

}

const mapStateToProps = ({ web3 }) => ({ web3 })
const mapDispacthToprops = dispatch => ({
  setInjected: bool => dispatch(setInjected(bool))
})

export default connect(mapStateToProps, mapDispacthToprops)(Web3Provider)
