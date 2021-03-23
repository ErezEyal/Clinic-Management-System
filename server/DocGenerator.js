const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const InspectModule = require("docxtemplater/js/inspect-module");

const checkedBox = (bool) => {
  return bool ? "☒" : "☐";
};

function replaceErrors(key, value) {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce(function (error, key) {
      error[key] = value[key];
      return error;
    }, {});
  }
  return value;
}

function errorHandler(error) {
  console.log(JSON.stringify({ error: error }, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors
      .map(function (error) {
        return error.properties.explanation;
      })
      .join("\n");
    console.log("errorMessages", errorMessages);
    // errorMessages is a humanly readable message looking like this :
    // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}

const listTags = (fileName) => {
  const content = fs.readFileSync(path.resolve(__dirname, fileName), "binary");
  const zip = new PizZip(content);
  const iModule = InspectModule();
  var doc = new Docxtemplater(zip, { modules: [iModule], linebreaks: true });
  doc.render();
  const tags = iModule.getAllTags();
  console.log(tags);
};

const createDoc = (content, params) => {
  // const content = fs.readFileSync(path.resolve(__dirname, fileName), 'binary');
  const zip = new PizZip(content);
  let doc;
  try {
    doc = new Docxtemplater(zip, { linebreaks: true });
  } catch (error) {
    // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
    errorHandler(error);
  }
  //set the templateVariables
  doc.setData(params);

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render();
  } catch (error) {
    // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
    errorHandler(error);
  }

  var buf = doc.getZip().generate({ type: "nodebuffer" });

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  // fs.writeFileSync(path.resolve(__dirname, 'templates/output.docx'), buf);
  return buf;
};

const templateParams = {
  asd: "ירדנה ארזי",
  id: "1111111",
  testDate: "ה15 באפריל 2019",
  currentDate: "ה17 באפריל 2019",
  birthDate: "ה18 במרץ 2000",
  age: "15",
  gender: "זכר",
  bloodCount: checkedBox(false),
};

// const templateParams = {
//     name: 'ירדנה ארזי',
//     id: '1111111',
//     testDate: 'ה15 באפריל 2019',
//     currentDate: 'ה17 באפריל 2019',
//     birthDate: 'ה18 במרץ 2000',
//     age: "15",
//     gender: "זכר",
//     bloodCount: checkedBox(false)
// }

// createDoc("templates/p.docx", templateParams)
module.exports = { createDoc, listTags };
