const fs = require("fs");
csv = fs.readFileSync("input2.csv");

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

const splitElementsInMatrixBy = (matrix, char) => {
  for (let i = 1; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
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
  for (let i = 0; i < data.length; i++) {
    if (i <= 1) {
      newArray.push(data[i]);
      continue;
    }

    for (let j = 0; j < newArray.length; j++) {
      if (newArray[j][eidIndex][0] === data[i][eidIndex][0]) {
        duplicate = true;
        for (let y = 0; y < data[0].length; y++) {
          for (let z = 0; z < data[i][y].length; z++) {
            if (!newArray[j][y].includes(data[i][y][z])) {
              newArray[j][y].push(data[i][y][z]);
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
      switch (headers[j][0]) {
        case "eid":
        case "fullname":
          obj[headers[j][0]] = data[i][j][0];
          break;
        case "group":
          const groups = data[i][j];
          for (g in groups) {
            const group = data[i][j][g];
            if (group !== "") {
              obj["groups"].push(group);
            }
          }
          break;
        case "see_all":
        case "invisible":
          if (data[i][j][0] === "1" || data[i][j][0] === "yes") {
            obj[headers[j][0]] = true;
          } else {
            obj[headers[j][0]] = false;
          }
          break;
        case "phone":
        case "email":
          for (k in data[i][j]) {
            const address = data[i][j][k];
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

const emailPhoneNormilize = (data) => {
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
              // console.log(phone);
              if (phone.length === 11) {
                data[i][j][k] = "55" + phone;
              } else {
                data[i][j][k] = "";
              }
              // console.log(data[i][j][k]);
              break;
          }
        }
      }
    }
  }
  return data;
};

////////////////////////////////////////////////////////////////////////////////////

const csvString = csv.toString();

const csvNormalized = normalize(csvString);

const csvArray = csvNormalized.split("\n");

const csvMatrix = csvArray.map((row) => row.split(","));

let csvMatrixNormalized = splitElementsInMatrixBy(csvMatrix, "/");

csvMatrixNormalized = emailPhoneNormilize(csvMatrixNormalized);

const joinedByAid = joinRowsByEid(csvMatrixNormalized);

let headers = joinedByAid[0];

headers = headers.map((header) => header.split(" "));

const data = joinedByAid.slice(1);

const obj = matrixToObj(headers, data);

//console.log(obj);

let json = JSON.stringify(obj);
fs.writeFileSync("output.json", json);
