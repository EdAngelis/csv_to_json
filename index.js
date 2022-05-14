const fs = require("fs");

csv = fs.readFileSync("input.csv");

const csvArray = csv.toString().split("\n");
