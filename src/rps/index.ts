import { basename, relative } from 'node:path';

enum RPS {
    ROCK = "rock",
    PAPER = "paper",
    SCISSORS = "scissors"
}

function pickOne(arr: RPS[]): RPS {
    const choice = Math.floor(Math.random() * arr.length);
    return arr[choice];
}

const beatenBy: {
    [K in RPS]: RPS
} = {
    [RPS.ROCK]: RPS.PAPER,
    [RPS.PAPER]: RPS.SCISSORS,
    [RPS.SCISSORS]: RPS.ROCK,
};

function getResult(userChoice: RPS, computerChoice: RPS): string {
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

function cleanup(str: string): RPS | null {
    if (typeof str !== "string") {
        return null;
    }

    const clean: string = str.trim().toLowerCase();
    if (!Object.hasOwnProperty.call(beatenBy, clean)) {
        return null;
    }
    
    // here, our input must be a string -- it also must be a valid choice
    return clean as RPS;
}

function main() {
    const choices = Object.keys(beatenBy) as RPS[];

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