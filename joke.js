import fs from "fs";
import axios from "axios";
import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
import chalkAnimation from "chalk-animation";

const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));
const fileName = "leaderboard.txt";
const jokesArr = ["Hello My bro", "Hello My bro", "Hello My bro"];

let jokecount = 0;

async function welcome() {
  const title = chalkAnimation.rainbow(
    `Welcome to Dad Jokes Prison.\nYou cannot leave! (⌐■_■)`
  );
  await sleep();
  title.stop();

  console.log(
    `${chalk.bgBlueBright(
      "\n\n\n\nHOW TO GAIN YOUR FREEDOM\n"
    )}Listen to 3 dad jokes and you might be freed.\n`
  );
}

async function getJoke() {
  const spinner = createSpinner(
    chalkAnimation.karaoke("---------\n---------")
  ).start();

  try {
    const url = "https://icanhazdadjoke.com/";
    const config = { headers: { Accept: "application/json" } };
    const data = await axios.get(url, config);
    const joke = await data.data.joke;
    jokesArr.push(joke);
    spinner.success();
    fs.truncate(fileName, 0, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
    fs.readFile("leaderboard.txt", "utf8", (error, data) => {
      switch (data) {
        case "":
          fs.writeFile(fileName, `~ ${joke}\n`, (err) => {
            if (err) {
              console.error(err);
            }
            return;
          });
          break;
        case data:
          fs.appendFile(fileName, `\n~ ${joke}\n`, (err) => {
            if (err) {
              console.error(err);
            }
            return;
          });
          break;
        default:
          break;
      }
      if (error) {
        console.error(`Error reading ${fileName}:`, error);
      }
    });
    return joke;
  } catch (error) {
    const errorMessage = chalkAnimation.radar(
      "Seems like there was an error, you'll be here for a while （￣︶￣）↗　S"
    );
    setTimeout(() => errorMessage.stop(), 3000);
    spinner.stop();
    throw new Error(error);
  }
}

async function tellJoke() {
  const joke = await getJoke();
  if (joke) {
    console.log(`${chalk.blueBright(`JOKE ${jokecount}.`)}  ${joke}`);
    next();
    console.log("\n");
  }
  return;
}

async function next() {
  const option = await inquirer.prompt({
    name: "Choice",
    type: "list",
    message: "Proceed or Check Leaderboard",
    choices: ["Next", "Give up", "Leaderboard"],
  });
  return handleResponse(option.Choice);
}

function getLeaderboard() {
  const lineCountMap = new Map();

  jokesArr.forEach((line) => {
    let lineCount = 0;

    jokesArr.forEach((otherline) => {
      if (line === otherline) lineCount++;
    });
    lineCountMap.set(lineCount, line);
  });
  const counts = [...lineCountMap.keys()];
  const mode = Math.max(...counts);
  const mostpopular = lineCountMap.get(mode);
  console.log(`Your most popular joke was: ${mostpopular}`);
}

async function handleResponse(choice) {
  if (choice === "Next") {
    jokecount++;
    tellJoke(jokecount);
    return;
  } else if (jokecount >= 3 && choice === "Give up") {
    const congrats = chalkAnimation.neon("Congrats you're a DAD");
    setTimeout(() => congrats.stop(), 3000);
    return;
  } else if (choice === "Leaderboard") {
    getLeaderboard();
    return;
  }
  console.error(chalk.bgYellowBright("\n\n  Why'd you give up. SHAME!!!  "));
}

async function run() {
  await welcome();
  await tellJoke();
}
run();
