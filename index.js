const fs = require("fs");
csv = fs.readFileSync("input2.csv");

// METHODS BEGIN ##############################################################

const removeQuotas = (str) => {
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

const sortGroups = (data) => {
  for (i in data) {
    data[i]["groups"].sort();
  }
  return data;
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

const splitElementsInMatrixBy = (matrix, char) => {
  const headers = matrix[0];

  for (let i = 1; i < matrix.length; i++) {
    for (j in headers) {
      matrix[i][j] = matrix[i][j].split(char);
    }
  }
  return matrix;
};

const joinRowsByEid = (matrix) => {
  const data = trimAllElement(matrix); // remove spaces before and after a string from all elements
  const eidIndex = data[0].indexOf("eid");
  let newArray = [];
  let duplicate = false;
  const columns = data[0];

  for (i in data) {
    if (i <= 1) {
      newArray.push(data[i]);
      continue;
    }

    for (j in newArray) {
      const eidNewArray = newArray[j][eidIndex][0];
      const eidData = data[i][eidIndex][0];
      if (eidNewArray === eidData) {
        duplicate = true;
        for (c in columns) {
          const cell = data[i][c];
          for (r in cell) {
            const elementInArray = newArray[j][c].includes(cell[r]);
            if (!elementInArray) {
              newArray[j][c].push(cell[r]);
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

const emailPhoneValidate = (data) => {
  const headers = data[0].map((header) => header.split(" "));

  for (let i = 1; i < data.length; i++) {
    for (j in headers) {
      const header = headers[j][0];
      if (header === "email" || header === "phone") {
        for (k in data[i][j]) {
          switch (header) {
            case "email":
              // the expression below generate a array with the email in position 0 if there is a valid email
              const email = data[i][j][k].match(/\S+@[^\s.]+\.[^.\s]+/);
              if (email) {
                data[i][j][k] = email[0];
              } else {
                data[i][j][k] = "";
              }
              break;
            case "phone":
              const phone = data[i][j][k].replace(/\D/g, ""); // thake just the numbers from the phone
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

const matrixToObj = (headers, data) => {
  let arrayOfObj = [];

  for (i in data) {
    let obj = {};
    obj["groups"] = [];
    obj["addresses"] = [];

    for (j in headers) {
      const cell = data[i][j];
      const header = headers[j][0];

      switch (header) {
        case "eid":
        case "fullname":
          obj[header] = cell[0];
          break;

        case "group":
          const groups = cell;
          for (g in groups) {
            const group = cell[g];
            if (group !== "") {
              obj["groups"].push(group);
            }
          }
          break;

        case "see_all":
        case "invisible":
          if (cell[0] === "1" || cell[0] === "yes") {
            obj[header] = true;
          } else {
            obj[header] = false;
          }
          break;

        case "phone":
        case "email":
          for (k in cell) {
            const address = cell[k];
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

// METHODS END ################################################################

let csvString = csv.toString();

// in csv two elements can come as one  when inside quotas and separeted by commas
// the function remove the quotas and put / rather than commas to normalize all data
csvString = removeQuotas(csvString);

const csvArray = csvString.split("\n");

let csvMatrix = csvArray.map((row) => row.split(","));

// separete elements when in same cell
csvMatrix = splitElementsInMatrixBy(csvMatrix, "/");

csvMatrix = emailPhoneValidate(csvMatrix);

csvMatrix = joinRowsByEid(csvMatrix);

const headers = csvMatrix[0].map((header) => header.split(" "));

const data = csvMatrix.slice(1);

const obj = matrixToObj(headers, data);

let json = JSON.stringify(obj);
fs.writeFileSync("output.json", json);
