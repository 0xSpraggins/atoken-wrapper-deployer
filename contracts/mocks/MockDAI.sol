// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDAI is ERC20Permit {
    constructor() ERC20Permit("Mock DAI") ERC20("Mock DAI", "mDAI") {
        _mint(address(2), 1e18);
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function burn(address from, uint256 value) public {
        _burn(from, value);
    }
}
