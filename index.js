const fs = require("fs");

csv = fs.readFileSync("input.csv");

const removeFlags = (str) => {
  let inSideflag = false;
  newStr = "";
  for (let char of str) {
    if (char === '"') {
      inSideflag = !inSideflag;
    }
    if (char === "," && inSideflag) {
      char = "/";
    }
    if (char !== '"') {
      newStr += char;
    }
  }
  return newStr;
};

const normalize = (str) => {
  const noFlags = removeFlags(str);

  return noFlags;
};
const csvString = csv.toString();

const csvNormiled = normalize(csvString);
