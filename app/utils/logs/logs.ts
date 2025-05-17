import { createWriteStream, existsSync, mkdirSync, statSync } from "fs";

const ESC_CHAR = "\x1b";
const START_FOREGROUND = `${ESC_CHAR}[38;2;`;
const START_BACKGROUND = `${ESC_CHAR}[48;2;`;

function centerLabel(label:string, width:number) {
  const totalPadding = width - label.length
  const left = Math.floor(totalPadding / 2)
  const right = totalPadding - left
  return " ".repeat(left) + label + " ".repeat(right)
}

const labels = ["[ERR]", "[INFO]", "[ACTION]", "[LOG]", "[WARNING]", "[✔]", "[X]"]
const maxLen = Math.max(...labels.map(l => l.length)) + 2 // +2 pour espace à gauche et droite


export const COLORCODELIST: Record<string, string> = {
  // Effect
  reset: `${ESC_CHAR}[0m`,
  bold: `${ESC_CHAR}[1m`,
  dim: `${ESC_CHAR}[2m`,
  underscore: `${ESC_CHAR}[4m`,
  blink: `${ESC_CHAR}[5m`,
  reverse: `${ESC_CHAR}[7m`,
  hidden: `${ESC_CHAR}[8m`,
  // Text Color
  fgBlack: `${START_FOREGROUND}0;0;0m`,
  fgRed: `${START_FOREGROUND}255;0;0m`,
  fgGreen: `${START_FOREGROUND}0;255;0m`,
  fgBlue: `${START_FOREGROUND}0;0;255m`,
  fgOrange: `${START_FOREGROUND}255;170;0m`,
  fgYellow: `${START_FOREGROUND}255;255;0m`,
  fgCyan: `${START_FOREGROUND}0;255;255m`,
  fgWhite: `${START_FOREGROUND}255;255;255m`,
  fgMagenta: `${START_FOREGROUND}170;0;170m`,
  // Background Color
  bgBlack: `${START_BACKGROUND}0;0;0m`,
  bgRed: `${START_BACKGROUND}255;0;0m`,
  bgGreen: `${START_BACKGROUND}0;255;0m`,
  bgBlue: `${START_BACKGROUND}0;0;255m`,
  bgOrange: `${START_BACKGROUND}255;170;0m`,
  bgYellow: `${START_BACKGROUND}255;255;0m`,
  bgCyan: `${START_BACKGROUND}0;255;255m`,
  bgWhite: `${START_BACKGROUND}255;255;255m`,
  bgMagenta: `${START_BACKGROUND}170;0;170m`,
};

interface WriteStream {
  filename: string;
  stream: ReturnType<typeof createWriteStream>;
  date: number;
}

export class Logger {
  private prefix: string ="";
  private writeToFile: boolean;
  private path: string="./log";
  private writeStream: WriteStream;

  constructor(path: string = "./log", prefix: string = "", writeToFile: boolean = true) {
    if (prefix && prefix !== "") this.prefix = `${prefix} -`;
    const signals = ["SIGTERM", "SIGINT", "exit"];
    signals.forEach((signal) => {
      process.on(signal, (code) => {
        if (code !== 0) this.errorLog(`Process ended with code ${code} !!`);
        else this.infoLog("Closing process.");
        this.actionLog("Closing stream.");
        this.close();
      });
    });
    this.writeToFile = writeToFile;
    try {
      this.setLogDirectory(path);
      this.writeStream = this.createWriteStream();
    } catch (err) {
      this.writeToFile = false;
      this.errorLog(`Something went wrong : ${err}`);
      this.failureLog(`Couldn't initialize the Logger.`);
      process.exit();
    }
    this.successLog(`Initialization complete.`);
  }

  getVersion(): number {
    return parseFloat("1.2");
  }

  setLogDirectory(path: string): void {
    try {
      if (!existsSync(path)) mkdirSync(path, { recursive: true });
      if (!statSync(path).isDirectory()) throw `${path} is not a directory.`;
      if (path.endsWith("/|\\")) this.path = path.slice(0, -1);
      this.path = path;
    } catch (err) {
      throw err;
    }
  }

  createWriteStream(): WriteStream {
    const NOW = new Date();
    NOW.setHours(0);
    NOW.setMinutes(0);
    NOW.setSeconds(0);
    const FILENAME = `${NOW.getDate().toString().padStart(2, "0")}_${(NOW.getMonth() + 1)
      .toString()
      .padStart(2, "0")}_${NOW.getFullYear()}.log`;
    return {
      filename: FILENAME,
      stream: createWriteStream(`${this.path}/${FILENAME}`, { flags: "a" }),
      date: NOW.getDate() + 1,
    };
  }

  write(log: string): void {
    if (this.writeToFile) {
      if (this.writeStream.date < new Date().getTime()) this.writeStream = this.createWriteStream();
      this.writeStream.stream.write(`${log}\r\n`);
    }
  }

  horodater(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} : `;
  }

  errorLog(errorText: string): void {
    const HORODATAGE = this.horodater();
    console.log(
      `${COLORCODELIST.blink}${COLORCODELIST.bgRed}${COLORCODELIST.fgBlack}${centerLabel("[ERR]",maxLen)}${COLORCODELIST.reset} ${HORODATAGE} ${this.prefix} ${errorText}`
    );
    this.write(`${centerLabel("[ERR]",maxLen)}  ${HORODATAGE} ${errorText}`);
  }

  infoLog(infoText: string): void {
    const HORODATAGE = this.horodater();
    console.log(
      `${COLORCODELIST.fgCyan}${centerLabel("[INFO]",maxLen)}${COLORCODELIST.reset} ${HORODATAGE} ${this.prefix} ${infoText}`
    );
    this.write(`${centerLabel("[INFO]",maxLen)} ${HORODATAGE} ${infoText}`);
  }

  actionLog(actionText: string): void {
    const HORODATAGE = this.horodater();
    console.log(
      `${COLORCODELIST.fgYellow}${centerLabel("[ACTION]",maxLen)}${COLORCODELIST.reset} ${HORODATAGE} ${this.prefix} ${actionText}`
    );
    this.write(`${centerLabel("[ACTION]",maxLen)} ${HORODATAGE} ${actionText}`);
  }

  consoleLog(texte: string): void {
    const HORODATAGE = this.horodater();
    console.log(`${centerLabel("[LOG]",maxLen)} ${HORODATAGE} ${this.prefix} ${texte}`);
    this.write(`${centerLabel("[LOG]",maxLen)} ${HORODATAGE} ${texte}`);
  }

  warningLog(warningText: string): void {
    const HORODATAGE = this.horodater();
    console.log(
      `${COLORCODELIST.fgBlack}${COLORCODELIST.bgOrange}${centerLabel("[WARNING]",maxLen)}${COLORCODELIST.reset} ${HORODATAGE} ${this.prefix} ${warningText}`
    );
    this.write(`${centerLabel("[WARNING]",maxLen)} ${HORODATAGE} ${warningText}`);
  }

  successLog(sucessText: string): void {
    const HORODATAGE = this.horodater();
    console.log(
      `${COLORCODELIST.bold}${COLORCODELIST.fgGreen}${centerLabel("[✔]",maxLen)}${COLORCODELIST.reset} ${HORODATAGE} ${this.prefix} ${sucessText}`
    );
    this.write(`${centerLabel("[✔]",maxLen)} ${HORODATAGE} ${sucessText}`);
  }

  failureLog(failureText: string): void {
    const HORODATAGE = this.horodater();
    console.log(
      `${COLORCODELIST.bold}${COLORCODELIST.fgRed}${centerLabel("[X]",maxLen)}${COLORCODELIST.reset} ${HORODATAGE} ${this.prefix} ${failureText}`
    );
    this.write(`${centerLabel("[X]",maxLen)} ${HORODATAGE} ${failureText}`);
  }

  close(): void {
    if (this.writeStream !== undefined)
      this.writeStream.stream.close((err: any) => {
        if (err) console.log(`couldn't close the stream : ${err}`);
        process.exit()
      });
  }
}
