// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

abstract contract MockProxy is TransparentUpgradeableProxy {}