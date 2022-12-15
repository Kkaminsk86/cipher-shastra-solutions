// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract UndeadSolution {
    address public mortalAddr;

    function deploy(bytes32 salt) external {
        // Mortal source code:
        // contract Mortal {
        //     bytes32 public deadYet = hex"0000000000000000000000000000000000000000000000000000556e44654144";
        // }
        // Minimal Mortal bytecode to deploy (after optimisation). Runtime bytecode have length of required 15 (bytes).
        bytes
            memory code = hex"600f600c600039600f6000f365556e4465414460805260206080f3";

        address addr;
        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        mortalAddr = addr;
    }
}
