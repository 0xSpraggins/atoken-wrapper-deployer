import originalBytecode from "../original_wrapper_bytecode.json";
import deployedBytecode from "../artifacts/contracts/ATokenVault.sol/ATokenVault.json";

async function compare() {
    if (originalBytecode.bytecode.toString() === deployedBytecode.toString()) {
        console.log("Bytecode matches");
    } else {
        console.log("Bytecode does not match");
    }
}

compare();