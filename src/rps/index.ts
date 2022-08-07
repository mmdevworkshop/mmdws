import { basename, relative } from 'node:path';

function pickOne(arr) {
    const choice = Math.floor(Math.random() * arr.length);
    return arr[choice];
}

const beatenBy = {
    "rock": "paper",
    "paper": "scissors",
    "scissors": "rock",
};

function getResult(userChoice, computerChoice) {
    if (userChoice === computerChoice) {
        return "It's a tie!";
    }
    if (beatenBy[userChoice] === computerChoice) {
        return "You lose :(";
    }
    if (beatenBy[computerChoice] === userChoice) {
        return "You win!";
    }
    
    // should never get here
    throw new Error("Should never get here");
}

function cleanup(str) {
    if (typeof str === "string") {
        return str.trim().toLowerCase();
    }
    return null;
}

function main() {
    const choices = Object.keys(beatenBy);

    const userChoice = cleanup(process.argv[2]);
    if (Object.hasOwnProperty.call(beatenBy, userChoice)) {
        const computerChoice = pickOne(choices);
        const result = getResult(userChoice, computerChoice);

        console.log(`User chose "${userChoice}"`);
        console.log(`Computer chose "${computerChoice}"`);
        console.log("Result:", result);
    } else {
        console.log(`Error: "${
            process.argv[2]
        }" is not a valid choice. Usage: ${
            basename(process.argv[0])
        } ${
            relative(process.cwd(), process.argv[1])
        } {${
            choices.join("|")
        }}`);
    }
}

main();