const fs = require("fs");
csv = fs.readFileSync("input2.csv");

// METHODS BEGIN ##############################################################

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

const splitElementsInMatrixBy = (matrix, char) => {
  const headers = matrix[0];
  for (let i = 1; i < matrix.length; i++) {
    for (j in headers) {
      matrix[i][j] = matrix[i][j].split(char);
    }
  }
  return matrix;
};

const trimAllElement = (data) => {
  for (i in data) {
    for (j in data[i]) {
      for (k in data[i][j]) {
        data[i][j][k] = data[i][j][k].trim();
      }
    }
  }
  return data;
};

const joinRowsByEid = (matrix) => {
  const data = trimAllElement(matrix);
  const eidIndex = data[0].indexOf("eid");
  let newArray = [];
  let duplicate = false;
  const headers = data[0];
  for (i in data) {
    if (i <= 1) {
      newArray.push(data[i]);
      continue;
    }

    for (j in newArray) {
      if (newArray[j][eidIndex][0] === data[i][eidIndex][0]) {
        duplicate = true;
        for (y in headers) {
          const rowCell = data[i][y];
          for (z in rowCell) {
            if (!newArray[j][y].includes(rowCell[z])) {
              newArray[j][y].push(rowCell[z]);
            }
          }
        }
      } else {
        duplicate = false;
      }
    }
    if (!duplicate) {
      newArray.push(matrix[i]);
    }
  }
  return newArray;
};

const sortGroups = (data) => {
  for (i in data) {
    data[i]["groups"].sort();
  }
  return data;
};

const matrixToObj = (headers, data) => {
  let arrayOfObj = [];
  for (i in data) {
    let obj = {};
    obj["groups"] = [];
    obj["addresses"] = [];
    for (j in headers) {
      const rowCell = data[i][j];
      const header = headers[j][0];
      switch (header) {
        case "eid":
        case "fullname":
          obj[header] = rowCell[0];
          break;
        case "group":
          const groups = rowCell;
          for (g in groups) {
            const group = rowCell[g];
            if (group !== "") {
              obj["groups"].push(group);
            }
          }
          break;
        case "see_all":
        case "invisible":
          if (rowCell[0] === "1" || rowCell[0] === "yes") {
            obj[header] = true;
          } else {
            obj[header] = false;
          }
          break;
        case "phone":
        case "email":
          for (k in rowCell) {
            const address = rowCell[k];
            if (address) {
              let adress = {
                type: headers[j][0],
                tags: headers[j].slice(1),
                address: address,
              };
              obj["addresses"].push(adress);
            }
          }
          break;
      }
    }
    arrayOfObj.push(obj);
  }

  return sortGroups(arrayOfObj);
};

const emailPhoneNormalize = (data) => {
  const headers = data[0].map((header) => header.split(" "));

  for (let i = 1; i < data.length; i++) {
    for (j in headers) {
      const header = headers[j][0];
      if (header === "email" || header === "phone") {
        for (k in data[i][j]) {
          switch (header) {
            case "email":
              // the expression below generate a array with the email in position 0
              const email = data[i][j][k].match(/\S+@[^\s.]+\.[^.\s]+/);
              if (email) {
                data[i][j][k] = email[0];
              } else {
                data[i][j][k] = "";
              }
              break;
            case "phone":
              const phone = data[i][j][k].replace(/\D/g, "");
              if (phone.length === 11) {
                data[i][j][k] = "55" + phone;
              } else {
                data[i][j][k] = "";
              }
              break;
          }
        }
      }
    }
  }
  return data;
};

// METHODS END ################################################################

let csvString = csv.toString();

csvString = removeFlags(csvString);

const csvArray = csvString.split("\n");

let csvMatrix = csvArray.map((row) => row.split(","));

csvMatrix = splitElementsInMatrixBy(csvMatrix, "/");

csvMatrix = emailPhoneNormalize(csvMatrix);

csvMatrix = joinRowsByEid(csvMatrix);

const headers = csvMatrix[0].map((header) => header.split(" "));

const data = csvMatrix.slice(1);

const obj = matrixToObj(headers, data);

let json = JSON.stringify(obj);
fs.writeFileSync("output.json", json);
