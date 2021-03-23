const admin = require("firebase-admin");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const MONGO_URI = process.env.MONGO_URI;
const MONGO_ATLAS_URI = process.env.MONGO_ATLAS_URI;
const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;
const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
const calendarApi = require("./calendarApi.js");
const Dropbox = require("dropbox").Dropbox;
const { createDoc } = require("./DocGenerator");
const groupBy = require("lodash.groupby");
const fs = require("fs");
const http = require("http");
const https = require("https");

let db;
const dbName = "clinic";
const atlasClient = new MongoClient(MONGO_ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif"];

const permissions = {
  "/api/patients": 1,
  "/api/patients-photos": 1,
  "/signup": {
    post: "manageUsers",
  },
  "/api/events": {
    post: "viewLogs",
  },
  "/api/audit": 1,
  "/api/templates": 1,
  "/api/task": 1,
  "/api/tasks": 1,
  "/api/open-items": 1,
  "/api/closed-tasks": 1,
  "/api/taskgroups": 1,
  "/api/taskgroup": 1,
  "/api/calendar-events": 1,
  "/api/event": {
    post: "addCalendarEvents",
    patch: "addCalendarEvents",
    delete: "addCalendarEvents",
  },
  "/api/patient-files": {
    post: "viewDocuments",
  },
  "/api/patient-file": {
    post: "viewDocuments",
  },
  "/api/patient-photos": {
    post: "viewPhotos",
  },
  "/api/patient": {
    post: "addCustomer",
    put: "updateCustomer",
    delete: "deleteCustomer",
  },
  "/api/export-patients": 1,
  "/api/export-audit": 1,
  "/api/export-users": 1,
  "/api/patient-category": {
    patch: "editPatientCategories",
  },
  "/api/procedure": {
    patch: "editProcedures",
  },
  "/api/patient-categories": 1,
  "/api/procedures": 1,
  "/api/document": {
    post: "createDocs",
  },
  "/api/doc-fields": {
    post: "createDocs",
    patch: "createDocs",
  },
  "/api/users": 1,
  "/api/user": {
    delete: "manageUsers",
    patch: "manageUsers",
  },
  "/api/user-photo": 1,
  "/api/roles": {
    post: "manageUsers",
  },
  "/api/role": {
    post: "manageUsers",
    patch: "manageUsers",
    delete: "manageUsers",
  },
  "/api/role-permissions": 1,
  "/api/timeline": 1,
  "/api/patient-event": {
    post: "manageUsers",
    patch: "manageUsers",
    delete: "manageUsers",
  },
};

if (process.argv[2] === "prod") {
  console.log("# Production #");
  const options = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/app.barelclinic.com/privkey.pem"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/app.barelclinic.com/fullchain.pem"
    ),
  };
  app.use(express.static(path.join(__dirname, "build"), { index: false }));

  https.createServer(options, app).listen(443, async () => {
    console.log("HTTPS server is listening on port 443 \n");
    await initialServerActions();
  });

  http.createServer(app).listen(80, () => {
    console.log("HTTP server is listening on port 80 \n");
  });
}

if (process.argv[2] !== "prod") {
  console.log("# Development #");
  app.listen(process.argv[3], async () => {
    console.log(
      "Success - server app listening on port " + process.argv[3] + "\n"
    );
    await initialServerActions();
  });
}

const initialServerActions = async () => {
  await atlasClient.connect();
  db = atlasClient.db(dbName);
  db.collection("roles").updateOne(
    { admin: true },
    { $set: { admin: true, name: "אדמין" } },
    { upsert: true }
  );
  db.collection("taskGroups").updateOne(
    { closedTasks: true },
    { $set: { title: "מטלות סגורות", closedTasks: true } },
    { upsert: true }
  );
  console.log("Success - connected to DB\n");
  return true;
};

const authorization = async (req, res, next) => {
  const reqPath = req.baseUrl + req.path;
  const idToken = req.body.idToken || "";
  const isValid = await validateToken(idToken)
    .then((decodedToken) => {
      if (
        !decodedToken ||
        Math.floor(Date.now() / 1000) - decodedToken.auth_time > 1209600
      ) {
        throw "No valid token";
      }
      req.userEmail = decodedToken.email;
      req.userRole = decodedToken.role;
      return true;
    })
    .catch((error) => {
      res.status(403).json([]);
      return false;
    });

  if (!isValid) {
    return;
  }

  if (await userIsAllowed(req.userRole, reqPath, req.method.toLowerCase())) {
    next();
  } else {
    res.status(403).json([]);
  }
};

const userIsAllowed = (role, path, method) => {
  if (!permissions[path]) return false;
  const requiredPermission =
    permissions[path] !== 1 ? permissions[path][method] : 1;
  // console.log("permission needed", requiredPermission);
  if (requiredPermission === 1) return true;
  return db
    .collection("roles")
    .findOne({ name: role })
    .then((res) => {
      if (res[requiredPermission] || res.admin) {
        return true;
      }
      return false;
    })
    .catch(() => {
      return false;
    });
};

const getPermissions = async (idToken) => {
  let role = null;
  await validateToken(idToken)
    .then((decodedToken) => {
      if (decodedToken) {
        role = decodedToken.role;
      }
    })
    .catch((error) => {
      console.log(error);
    });

  return db
    .collection("roles")
    .findOne({ name: role })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.log(error);
      console.log(role);
      return null;
    });
};

const createAuditLog = async (action, details, token, moreDetails = null) => {
  const email = await validateToken(token)
    .then((decodedToken) => {
      if (decodedToken) {
        return decodedToken.email;
      }
    })
    .catch((error) => {
      console.log(error);
      return "";
    });

  const event = {
    action: action,
    details: details,
    moreDetails: moreDetails,
    user: email,
    date: Date.now(),
  };
  console.log("audit event:", event);
  db.collection("events").insertOne(event);
};

const getPatientsCSV = () => {
  return getPatientsList(null)
    .then((users) => {
      let csvStr =
        "שם פרטי, שם משפחה, מייל, מין, טלפון, תאריך לידה, תעודת זהות, דרכון, שיוך, פעולות, עיר, כתובת, שדה1, שדה2, שדה3\n";
      for (user of users) {
        const birthDate = user.birthDate
          ? new Date(user.birthDate).toLocaleDateString()
          : user.birthDate;
        const category = user.category ? user.category.join("; ") : "";
        const procedures = user.procedures ? user.procedures.join("; ") : "";
        csvStr += `${user.firstName}, ${user.lastName}, ${user.email}, ${user.gender}, ${user.phone}, ${birthDate}, ${user.id}, ${user.passport}, ${category}, ${procedures}, ${user.city}, ${user.address}, ${user.bool1}, ${user.bool2}, ${user.bool3} \n`;
      }
      return csvStr;
    })
    .catch((error) => {
      return "";
    });
};

const getAuditEventsCSV = () => {
  return getAllAuditEvents()
    .then((events) => {
      let csvStr = "תאריך, פעולה, משתמש, פרטים, פרטים נוספים\n";
      for (e of events) {
        const date = new Date(e.date).toLocaleString();
        const more = e.moreDetails
          ? e.moreDetails.replace(/(?:\r\n|\r|\n)/g, ".").replace(",", ";")
          : "";
        csvStr += `${date}, ${e.action}, ${e.user}, ${e.details}, ${more}\n`;
      }
      return csvStr;
    })
    .catch((error) => {
      return "";
    });
};

const getUsersCSV = () => {
  return listAllUsers()
    .then((users) => {
      let csvStr = "שם, מייל, טלפון, אימות דו שלבי, תפקיד\n";
      for (user of users) {
        csvStr += `${user.name}, ${user.email}, ${user.phoneNumber}, ${user.mfa}, ${user.role}\n`;
      }
      return csvStr;
    })
    .catch((error) => {
      return "";
    });
};

const validateToken = async (idToken) => {
  const isValid = await admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      return decodedToken;
    })
    .catch((error) => {
      if (error.code == "auth/argument-error") {
        console.log("Invalid ID Token");
      } else {
        console.log("Couldn't validate ID token: ", error.message);
      }
      return null;
    });
  return isValid;
};

const setUserClaim = (uid, claimObject) => {
  admin
    .auth()
    .setCustomUserClaims(uid, claimObject)
    .then(() => {
      console.log("The following claim was set: ", claimObject);
    })
    .catch((error) => console.log(error));
};

const getAllAuditEvents = () => {
  return db.collection("events").find({}).sort({ _id: -1 }).toArray();
};

const getAuditEvents = async (filter, page) => {
  const filterRegExp = new RegExp(filter);
  const eventsCount = await db.collection("events").countDocuments();
  const filteredCount = await db.collection("events").countDocuments({
    $or: [
      { action: filterRegExp },
      { user: filterRegExp },
      { details: filterRegExp },
      { moreDetails: filterRegExp },
    ],
  });

  // const filteredCount = await db.collection("events").countDocuments();
  const events = await db
    .collection("events")
    .find({
      $or: [
        { action: filterRegExp },
        { user: filterRegExp },
        { details: filterRegExp },
        { moreDetails: filterRegExp },
      ],
    })
    .skip(page * 10)
    .limit(10)
    .sort({ _id: -1 })
    .toArray();

  return {
    totalCount: eventsCount,
    filteredCount: filteredCount,
    events: events,
  };
};

const getPatientsList = (sortBy, ids = null) => {
  let sortOrder = { _id: -1 };
  if (sortBy) {
    sortOrder = sortBy;
  }
  if (ids) {
    const objectIds = ids.map((id) => {
      return new ObjectId(id);
    });
    return db
      .collection("patients")
      .find({ _id: { $in: objectIds } })
      .sort(sortOrder)
      .toArray();
  } else {
    return db
      .collection("patients")
      .find({})
      .project({ picture: 0 })
      .sort(sortOrder)
      .toArray();
  }
};

const saveTask = (task) => {
  if (!task._id) {
    return db.collection("tasks").insertOne(task);
  } else {
    task._id = ObjectId(task._id);
    return db.collection("tasks").replaceOne({ _id: task._id }, task);
  }
};

const deleteTask = (task) => {
  task._id = ObjectId(task._id);
  return db.collection("tasks").deleteOne({ _id: task._id });
};

const getAllTasks = async () => {
  let tasks = [];
  const cleanedAt = await db
    .collection("taskGroups")
    .findOne({ closedTasks: true })
    .then((closedTasksGroup) => {
      return closedTasksGroup.cleanedAt;
    });
  if (cleanedAt) {
    tasks = await db
      .collection("tasks")
      .find({
        $or: [
          { closedAt: { $gt: cleanedAt } },
          { closedAt: { $exists: false } },
        ],
      })
      .sort({ _id: -1 })
      .toArray();
  } else {
    tasks = await db.collection("tasks").find().sort({ _id: -1 }).toArray();
  }

  return tasks.map((task) => {
    let nextDueDate = 0;
    task.items.forEach((item) => {
      if (!item.done && (!nextDueDate || item.date < nextDueDate)) {
        nextDueDate = item.date;
      }
    });
    task.dueDate = nextDueDate;
    return task;
  });
};

const getTaskGroups = (email) => {
  return db
    .collection("taskGroups")
    .find()
    .sort({ closedTasks: 1, _id: 1 })
    .toArray();
};

const cleanClosedTasks = () => {
  return db
    .collection("taskGroups")
    .updateOne({ closedTasks: true }, { $set: { cleanedAt: Date.now() } })
    .then((res) => {
      if (res.matchedCount) {
        return true;
      } else {
        console.log(res);
        return false;
      }
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

const getRoles = () => {
  return db.collection("roles").find().toArray();
};

const newRole = (name) => {
  return db
    .collection("roles")
    .insertOne({ name: name })
    .then((res) => {
      if (res.insertedCount) {
        return true;
      } else {
        return false;
      }
    });
};

const updateRole = async (roleId, permission) => {
  if (permission.admin) return false;
  const roleID = ObjectId(roleId);
  return db
    .collection("roles")
    .updateOne({ _id: roleID }, { $set: permission });
};

const createTaskGroup = (email) => {
  const taskGroup = {
    title: "",
    email: email,
  };
  return db.collection("taskGroups").insertOne(taskGroup);
};

const updateTaskGroupTitle = (title, id) => {
  const groupID = ObjectId(id);
  return db
    .collection("taskGroups")
    .updateOne({ _id: groupID }, { $set: { title: title } });
};

const deleteRole = (id) => {
  const roleID = ObjectId(id);
  return db.collection("roles").deleteOne({ _id: roleID });
};

const deleteTasksGroup = (id) => {
  const groupID = ObjectId(id);
  return db.collection("taskGroups").deleteOne({ _id: groupID });
};

const createPatient = (patient) => {
  return db
    .collection("patients")
    .insertOne(patient)
    .then((res) => {
      if (res.insertedCount) {
        console.log("created patient id", res.insertedId);
        return res.insertedId.toString();
      } else {
        return "";
      }
    });
};

const updatePatient = (patient) => {
  const taskId = ObjectId(patient._id);
  delete patient._id;
  return db
    .collection("patients")
    .updateOne({ _id: taskId }, { $set: patient })
    .then((res) => {
      if (res.matchedCount) {
        return true;
      } else {
        return false;
      }
    });
};

const getUserOpenItems = async (userId) => {
  let items = 0;
  await getAllTasks().then((tasks) => {
    tasks.forEach((task) => {
      if (task.closedAt) {
        return;
      }
      task.items.forEach((item) => {
        if (item.userId && item.userId === userId && !item.done) {
          items++;
        }
      });
    });
  });
  return {
    items: items,
  };
};

const deletePatient = async (id, idToken) => {
  const patientId = ObjectId(id);
  const patient = await db
    .collection("patients")
    .findOne({ _id: patientId })
    .then((patient) => patient)
    .catch((err) => "");

  return db
    .collection("patients")
    .deleteOne({ _id: patientId })
    .then((res) => {
      if (res.deletedCount) {
        const details =
          "הלקוח " +
          patient.firstName +
          " " +
          patient.lastName +
          " נמחק מהמערכת";
        let moreDetails = "תעודת זהות: " + patient.id + "\n";
        moreDetails += "מזהה לקוח: " + id;
        createAuditLog("לקוח נמחק מהמערכת", details, idToken, moreDetails);
      }
      return getPatientsList(null);
    })
    .then((patients) => {
      return patients;
    });
};

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://crm-dev-e9cba.firebaseio.com",
});

const getFileLink = async (path) => {
  const argument = {
    path: path,
    //     settings: {
    //         requested_visibility: "password",
    //         link_password: "123456",
    //         access: "viewer"
    //     }
  };

  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });

  return dbx
    .sharingCreateSharedLinkWithSettings(argument)
    .then((response) => {
      return response.result.url;
    })
    .catch((error) => {
      if (
        error.error &&
        error.error.error &&
        error.error.error.shared_link_already_exists
      ) {
        return error.error.error.shared_link_already_exists.metadata.url;
      }
      return null;
    });
};

const getTemplateFile = async (path) => {
  // console.log("paath:", path)
  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
  const fileDownloadArgs = {
    path: path,
  };

  return dbx
    .filesDownload(fileDownloadArgs)
    .then((response) => {
      if (response.result && response.result.is_downloadable)
        return response.result.fileBinary;

      return null;
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
};

const getTemplateNames = async (classified) => {
  let templatesPath = "/תבניות";
  let normalTemplatesPath = "/תבניות/מסמכים רגילים";
  let filesArray = [];
  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
  const listFolderArgs = {
    path: classified ? templatesPath : normalTemplatesPath,
    recursive: true,
    limit: 50,
  };

  console.log(listFolderArgs.path);

  await dbx
    .filesListFolder(listFolderArgs)
    .then((response) => {
      response.result.entries.forEach((file) => {
        if (file[".tag"] === "file") {
          filesArray.push(file.path_lower);
        }
      });
      console.log("has_more", response.result.has_more);
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(filesArray);
  return filesArray;
};

const getPatientFiles = async (searchString, photos = false) => {
  console.log("getting files for: ", typeof searchString + " " + searchString);
  const photosFolder = "/תמונות";
  const docsFolder = "/מסמכי לקוח";

  const folderSearchArgument = {
    query: searchString.toString(),
    options: {
      path: photos ? photosFolder : docsFolder,
      max_results: 800,
      filename_only: true,
    },
  };

  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
  // get matched folders
  const folders = await dbx
    .filesSearchV2(folderSearchArgument)
    .then((response) => {
      const matches = response.result.matches;
      const files = matches.flatMap((match) => {
        if (match.metadata.metadata[".tag"] !== "folder") {
          return [];
        } else {
          return [match.metadata.metadata.path_lower];
        }
      });
      return files;
    })
    .catch((error) => {
      console.error(error);
      return [];
    });

  //get files in folders
  let filesArray = [];
  for (const folder of folders) {
    const listFolderArgs = {
      path: folder,
      recursive: true,
      limit: 1000,
    };
    await dbx
      .filesListFolder(listFolderArgs)
      .then((response) => {
        response.result.entries.forEach((file) => {
          let isImage = false;
          imageExtensions.forEach((extension) => {
            if (file.path_lower.includes(extension)) {
              isImage = true;
            }
          });
          filesArray.push({ path: file.path_lower });
        });
        console.log("has_more", response.result.has_more);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return filesArray;
};

const getFilesInFolders = async (searchString) => {
  const folderSearchArgument = {
    query: searchString,
    options: {
      max_results: 800,
      filename_only: true,
    },
  };

  console.log("Starting at ", new Date(Date.now()).toTimeString());

  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
  // get matched folders
  const folders = await dbx
    .filesSearchV2(folderSearchArgument)
    .then((response) => {
      const matches = response.result.matches;
      const files = matches.flatMap((match) => {
        if (match.metadata.metadata[".tag"] !== "folder") {
          return [];
        } else {
          return [match.metadata.metadata.path_lower];
        }
      });
      return files;
    })
    .catch((error) => {
      console.error(error);
      return [];
    });

  // const filesSearchArgument = {
  //   query: searchString,
  //   options: {
  //     max_results: 800,
  //     filename_only: true,
  //   },
  // };

  //get files in folders
  let filesArray = [];
  for (const folder of folders) {
    await dbx
      .filesListFolder({ path: folder })
      .then((response) => {
        response.result.entries.forEach((file) => {
          let isImage = false;
          imageExtensions.forEach((extension) => {
            if (file.path_lower.includes(extension)) {
              isImage = true;
            }
          });
          if (!isImage) {
            filesArray.push(file.path_lower);
          }
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // //testing
  // await dbx
  //   .sharingListSharedLinks()
  //   .then((res) => {
  //       console.log(
  //         "found the below shared links at ",
  //         new Date(Date.now()).toTimeString()
  //       );
  //       res.result.links.forEach((file) => {
  //         if (filesArray.includes(file.path_lower))
  //         const fileObject = {
  //           path: file.path_lowerle,
  //           link: file.url,
  //         };
  //         filesList.push(fileObject);
  //         console.log("path: ", file.path_lower)
  //         console.log("link: ", file.url)
  //       })
  //   })
  //   .catch((error) => {
  //     console.log("Error! - ", error);
  //   });

  // get shared links
  let filesList = [];
  for (const file of filesArray) {
    const argument = {
      path: file,
      //     settings: {
      //         requested_visibility: "password",
      //         link_password: "123456",
      //         access: "viewer"
      //     }
    };
    // console.log(
    //   "trying to find a shared link at ",
    //   new Date(Date.now()).toTimeString()
    // );
    await dbx
      .sharingListSharedLinks({ path: file, direct_only: true })
      .then((res) => {
        if (res.result.links[0].url) {
          // console.log(
          //   "found a shared link at ",
          //   new Date(Date.now()).toTimeString()
          // );
          const fileObject = {
            path: file,
            link: res.result.links[0].url,
          };
          filesList.push(fileObject);
        } else {
          throw "NoSharedLink";
        }
      })
      .catch(async (error) => {
        console.log("Can't list shared links for: ", file);
        await dbx
          .sharingCreateSharedLinkWithSettings(argument)
          .then((response) => {
            // if (response.url) {
            //     throw "no response url";
            // }
            const fileObject = {
              path: file,
              link: response.url,
            };
            filesList.push(fileObject);
          })
          .catch((error) => {
            console.log("Error creating shared link: ", error);
          });
      });
  }
  console.log(
    "finished getting shared links at ",
    new Date(Date.now()).toTimeString()
  );

  return filesList;
};

const uploadFileToDropboxFolder = async (path, file) => {
  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
  const fileUploadParams = {
    contents: file,
    path: path,
    autorename: true,
  };
  return (folders = await dbx
    .filesUpload(fileUploadParams)
    .then((response) => {
      if (response.result.path_lower) {
        return response.result.path_lower;
      } else {
        console.error(response);
        return false;
      }
    })
    .catch((error) => {
      console.error(error);
      return false;
    }));
};

const getAllUserPhotos = () => {
  return db.collection("usersPhotos").find().toArray();
};

const deleteUserPhoto = (uid) => {
  return db.collection("usersPhotos").deleteOne({ userId: uid });
};

const getPatientCategories = () => {
  return db.collection("patientCategories").find().toArray();
};

const addPatientCategory = async (category) => {
  const sameCategory = await db
    .collection("patientCategories")
    .find({ name: category })
    .toArray();

  if (!sameCategory.length) {
    await db.collection("patientCategories").insertOne({ name: category });
  }

  return getPatientCategories();
};

const deletePatientCategory = async (category) => {
  const sameCategory = await db
    .collection("patientCategories")
    .deleteOne({ name: category });

  return getPatientCategories();
};

const getProcedures = () => {
  return db.collection("procedures").find().toArray();
};

const addProcedure = async (procedure) => {
  const sameProcedure = await db
    .collection("procedures")
    .find({ name: procedure })
    .toArray();

  if (!sameProcedure.length) {
    await db.collection("procedures").insertOne({ name: procedure });
  }

  return getProcedures();
};

const deleteProcedure = async (procedure) => {
  const sameProcedure = await db
    .collection("procedures")
    .deleteOne({ name: procedure });

  return getProcedures();
};

const listAllUsers = async () => {
  try {
    const photoRecords = await getAllUserPhotos();
    const photosObject = {};
    for (const record of photoRecords) {
      photosObject[record.userId] = record.photo;
    }

    const listUsersResult = await admin.auth().listUsers();
    return listUsersResult.users.map((userRecord) => {
      return {
        email: userRecord.email,
        name: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        role: userRecord.customClaims.role,
        mfa: userRecord.multiFactor ? true : false,
        photo: photosObject[userRecord.uid]
          ? photosObject[userRecord.uid]
          : null,
        uid: userRecord.uid,
      };
    });
  } catch (error) {
    console.log("Error listing users:", error);
  }
};

const deleteUser = async (uid) => {
  await admin
    .auth()
    .deleteUser(uid)
    .then(() => {
      console.log("Successfully deleted user");
      deleteUserPhoto(uid);
    })
    .catch((error) => {
      console.log("Error deleting user:", error);
    });
  return listAllUsers();
};

const updateUser = async (uid, newFields) => {
  return await admin
    .auth()
    .updateUser(uid, newFields)
    .then((res) => {
      console.log("Successfully updated user");
      console.log(res);
      return true;
    })
    .catch((error) => {
      console.log("Error updating user:", error);
      return false;
    });
};

const changeUserRole = async (uid, newClaim) => {
  await admin
    .auth()
    .setCustomUserClaims(uid, null)
    .catch((error) => {
      console.log(error);
    });
  return admin
    .auth()
    .setCustomUserClaims(uid, newClaim)
    .then(() => {
      console.log("Successfully set new user claims:", newClaim);
      return true;
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

const createDocFromTemplate = async (
  fields,
  templateName,
  templateContent,
  patient
) => {
  const fileName = `${patient.firstName} ${patient.lastName} - ${
    patient.id || patient.passport
  } - ${templateName}`;
  const newFilePath = "/מסמכים חדשים/" + fileName;
  const doc = await createDoc(templateContent, fields);
  const dPFileLowerPath = await uploadFileToDropboxFolder(newFilePath, doc);
  if (dPFileLowerPath) {
    return getFileLink(dPFileLowerPath);
  }
  return false;
};

const getPatientEvents = (patientId) => {
  return db
    .collection("patientEvents")
    .find({ patientId: patientId })
    .sort({ date: -1 })
    .toArray();
};

const deletePatientEvent = (eventId) => {
  const id = ObjectId(eventId);
  return db.collection("patientEvents").deleteOne({ _id: id });
};

const newPatientEvent = (event) => {
  return db.collection("patientEvents").insertOne(event);
};

const updatePatientEvent = async (event) => {
  let eventId = null;
  let query;
  if (event._id) {
    eventId = ObjectId(event._id);
  } else if (event.eventId) {
    eventId = await db
      .collection("patientEvents")
      .findOne({ eventId: event.eventId })
      .then((event) => {
        console.log("event: ", event);
        return ObjectId(event._id);
      })
      .catch((err) => null);
  }

  if (!eventId && !event.eventId) {
    console.log("Could not find patient event", event);
    return false;
  }

  if (eventId) {
    query = {
      _id: eventId,
    };
  } else {
    query = {
      eventId: event.eventId,
    };
  }

  console.log("query", query);

  delete event._id;
  return db
    .collection("patientEvents")
    .updateOne(query, { $set: event }, { upsert: true })
    .then((res) => {
      if (res.matchedCount) {
        return true;
      } else {
        // console.log(res);
        return false;
      }
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

const createUserPhoto = (userId, photo) => {
  return db
    .collection("usersPhotos")
    .updateOne(
      { userId: userId },
      { $set: { userId: userId, photo: photo } },
      { upsert: true }
    );
};

const setNewPatientTaskEvents = async (previousTask, newTask, userName) => {
  if (!newTask.patientId) return;
  for (const item of newTask.items) {
    if ((!previousTask || !previousTask.items.length) && item.done) {
      newPatientEvent({
        title: item.title,
        description: "",
        date: Date.now(),
        patientId: newTask.patientId,
        userName: userName,
        taskId: item.id,
        template: "מטלה",
      });
    }
    if (!previousTask) return;
    const previousItem = previousTask.items.find(
      (oldTaskItem) => oldTaskItem.id === item.id
    );
    if (!previousItem && item.done) {
      newPatientEvent({
        title: item.title,
        description: "",
        date: Date.now(),
        patientId: newTask.patientId,
        userName: userName,
        taskId: item.id,
        template: "מטלה",
      });
    } else if (previousItem && previousItem.done !== item.done) {
      if (item.done) {
        newPatientEvent({
          title: item.title,
          description: "",
          date: Date.now(),
          patientId: newTask.patientId,
          userName: userName,
          taskId: item.id,
          template: "מטלה",
        });
      } else {
        getPatientEvents(newTask.patientId).then((events) => {
          console.log("previous", previousItem);
          console.log("new", item);
          if (item.id) {
            const event = events.find((e) => e.taskId === item.id);
            if (event) {
              deletePatientEvent(event._id);
            }
          }
        });
      }
    }
  }
};

const createPatientDPFolder = (patient) => {
  let folderName;
  if (patient.id) {
    folderName = `${patient.firstName} ${patient.lastName} - ${patient.id}`;
  } else if (patient.passport) {
    folderName = `${patient.firstName} ${patient.lastName} - ${patient.passport}`;
  }
  const params = {
    path: "/מסמכי לקוח/" + folderName,
    autorename: true,
  };

  let dbx = new Dropbox({ accessToken: DROPBOX_ACCESS_TOKEN });
  dbx
    .filesCreateFolderV2(params)
    .then((response) => {
      if (response.metadata)
        console.log("created folder at ", response.metadata.path_lower);
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
};

const getCustomDocFields = () => {
  return db
    .collection("customDocFields")
    .findOne({})
    .then((fields) => {
      if (!fields) return null;
      return [fields.fieldA, fields.fieldB, fields.fieldC, fields.fieldD];
    });
};

const updateCustomDocFields = (fields) => {
  return db.collection("customDocFields").updateOne(
    {},
    {
      $set: {
        fieldA: fields.fieldA,
        fieldB: fields.fieldB,
        fieldC: fields.fieldC,
        fieldD: fields.fieldD,
      },
    },
    {
      upsert: 1,
    }
  );
};

app.get("*", (req, res) => {
  if (process.argv.length > 2 && process.argv[2] === "prod") {
    if (req.secure) {
      res.sendFile(path.join(__dirname, "build", "index.html"));
    } else {
      res.redirect("https://" + process.env.HOST);
    }
  } else {
    res.send("This Is Dev Environment");
  }
});

app.post("/api/patients", authorization, (req, res) => {
  let sortBy = req.body.sortBy ? req.body.sortBy : null;
  getPatientsList(sortBy).then((patients) => {
    res.json(patients);
  });
});

app.post("/signup", authorization, (req, res) => {
  let claim = { role: "defaultRoleWithNoPermissions" };
  if (req.body.role) {
    claim.role = req.body.role;
  }
  let phone;
  if (req.body.phone) {
    if (req.body.phone.includes("+")) {
      phone = req.body.phone;
    } else {
      phone = "+972" + req.body.phone;
    }
  } else {
    phone = undefined;
  }

  admin
    .auth()
    .createUser({
      email: req.body.email,
      password: req.body.password,
      displayName: req.body.name,
      emailVerified: true,
      phoneNumber: req.body.phone,
      multiFactor: req.body.mfa
        ? {
            enrolledFactors: [
              {
                phoneNumber: phone,
                displayName: "main phone",
                factorId: "phone",
              },
            ],
          }
        : null,
    })
    .then((userRecord) => {
      console.log("Successfully created new user:", userRecord.uid);
      setUserClaim(userRecord.uid, claim);
      res.json({ result: true, authorized: true });

      let details = " המשתמש " + req.body.name + " נרשם למערכת";
      let moreDetails = " כתובת מייל: " + req.body.email + "\n";
      moreDetails += req.body.phone
        ? " טלפון: " + req.body.phone.replace("+", "") + "\n"
        : "";
      moreDetails +=
        req.body.mfa === true
          ? " אימות דו שלבי: פעיל" + "\n"
          : " אימות דו שלבי: כבוי" + "\n";
      moreDetails += " מזהה משתמש: " + userRecord.uid + "\n";
      moreDetails += " תפקיד: " + req.body.role;
      createAuditLog(
        "משתמש נרשם למערכת",
        details,
        req.body.idToken,
        moreDetails
      );
    })
    .catch((error) => {
      console.log("Error creating new user:", error);
      res.status(400).json({ result: false, authorized: true });
    });
});

app.post("/api/events", authorization, (req, res) => {
  const filter = req.body.filter || "";
  const page = req.body.page || 0;
  getAuditEvents(filter, page).then((events) => {
    res.json(events);
  });
});

app.post("/api/audit", (req, res) => {
  const idToken = req.body.idToken || "";
  let eventObject;
  let action = " undefined action ";
  const time = new Date(req.body.time).toLocaleString();
  if (req.body.event === "password reset") {
    const details = "נשלחה בקשה לאיפוס סיסמה עבור " + req.body.email;
    createAuditLog("בקשת איפוס סיסמה", details, idToken);
  } else if (req.body.event === "login") {
    validateToken(idToken)
      .then((token) => {
        if (token) {
          const details = "המשתמש " + token.name + " התחבר למערכת";
          const moreDetails = "מזהה משתמש: " + token.uid;
          createAuditLog("בוצעה התחברות", details, idToken, moreDetails);
        } else {
          res.json({ result: false });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json({ result: false });
      });
  } else if (req.body.event === "logout") {
    validateToken(idToken)
      .then((token) => {
        if (token) {
          const details = "המשתמש " + token.name + " התנתק מהמערכת";
          const moreDetails = "מזהה משתמש: " + token.uid;
          createAuditLog("בוצעה התנתקות", details, idToken, moreDetails);
        } else {
          res.json({ result: false });
        }
      })
      .catch((error) => {
        console.log(error);
        res.json({ result: false });
      });
  }
});

const taskItemsAuditLog = (previousItems, newItems, taskObject, idToken) => {
  const allItems = previousItems.concat(newItems);
  for (const item of allItems) {
    let action = "";
    let logTitle = "";
    let itemCreated = true;
    let itemDeleted = true;
    let itemUpdated = true;
    let oldItem;
    let updatedItem;
    for (const previousItem of previousItems) {
      if (item.id === previousItem.id) {
        itemCreated = false;
        oldItem = previousItem;
        break;
      }
    }
    for (const newItem of newItems) {
      if (itemCreated) {
        break;
      }
      if (item.id === newItem.id) {
        itemDeleted = false;
        updatedItem = newItem;
        if (item.title !== oldItem.title) {
          break;
        }
        if (item.done !== oldItem.done) {
          break;
        }
        if (item.date !== oldItem.date) {
          break;
        }
        if (item.userId !== oldItem.userId) {
          break;
        }
        itemUpdated = false;
      }
    }
    if (itemCreated) {
      updatedItem = item;
      itemDeleted = false;
      action = " המשימה " + item.title + " נוצרה";
      logTitle = "נוצרה משימה";
    } else if (itemDeleted) {
      action = " המשימה " + oldItem.title + " נמחקה";
      logTitle = "משימה נמחקה";
    } else if (itemUpdated) {
      action = " המשימה " + updatedItem.title + " עודכנה";
      logTitle = "משימה עודכנה";
    } else {
      continue;
    }
    const details = action;
    let moreDetails = "";
    moreDetails +=
      !itemDeleted && updatedItem.done
        ? "בוצע: כן" + "\n"
        : !itemDeleted && !updatedItem.done
        ? "בוצע: לא" + "\n"
        : "";
    moreDetails += !itemDeleted
      ? "תאריך יעד: " +
        new Date(updatedItem.date).toLocaleDateString("he") +
        "\n"
      : "";
    moreDetails += !itemDeleted ? "כותרת מטלה: " + taskObject.title + "\n" : "";
    moreDetails += "מזהה משימה: " + item.id + "\n";
    moreDetails += "מזהה מטלה: " + taskObject._id + "\n";
    moreDetails +=
      !itemDeleted && updatedItem.userId
        ? "מזהה משתמש: " + updatedItem.userId + "\n"
        : "";
    createAuditLog(logTitle, details, idToken, moreDetails);
  }
};

app.post("/api/task", authorization, async (req, res) => {
  const patientName = await db
    .collection("patients")
    .findOne({ _id: ObjectId(req.body.taskDetails.patientId) })
    .then((patient) => patient.firstName + " " + patient.lastName)
    .catch((err) => "");

  const previousTask = await getAllTasks().then((tasks) => {
    for (const task of tasks) {
      if (!task._id) {
        return null;
      }
      if (task._id.toString() === req.body.taskDetails._id) {
        return task;
      }
    }
  });
  saveTask(req.body.taskDetails)
    .then((result) => {
      if (result.insertedCount || result.matchedCount) {
        setNewPatientTaskEvents(
          previousTask,
          req.body.taskDetails,
          req.body.userName
        );

        const logTitle = previousTask ? "מטלה עודכנה" : "נוצרה מטלה";

        if (
          !previousTask ||
          req.body.taskDetails.title != previousTask.title ||
          req.body.taskDetails.description != previousTask.description ||
          req.body.taskDetails.group != previousTask.group ||
          req.body.taskDetails.patientId != previousTask.patientId
        ) {
          const details = " המטלה " + req.body.taskDetails.title + " עודכנה ";
          let moreDetails = "";
          moreDetails += req.body.taskDetails.description
            ? "תיאור: " + req.body.taskDetails.description + "\n"
            : "";
          moreDetails += patientName ? "לקוח: " + patientName + "\n" : "";
          moreDetails += "מזהה מטלה: " + req.body.taskDetails._id + "\n";
          moreDetails +=
            "מזהה קבוצת מטלות: " + req.body.taskDetails.group + "\n";
          moreDetails += req.body.taskDetails.patientId
            ? "מזהה לקוח: " + req.body.taskDetails.patientId
            : "";
          createAuditLog(logTitle, details, req.body.idToken, moreDetails);
        }
        const previousTaskItems = previousTask ? previousTask.items : [];
        taskItemsAuditLog(
          previousTaskItems,
          req.body.taskDetails.items,
          req.body.taskDetails,
          req.body.idToken
        );
        return getAllTasks();
      } else {
        res.json({ result: false, details: result });
      }
    })
    .then((tasks) => {
      res.json(tasks);
    });
});

app.delete("/api/task", authorization, (req, res) => {
  if (!req.body.taskDetails._id) {
    res.json({ result: false, details: "missing _ID field" });
  } else {
    deleteTask(req.body.taskDetails)
      .then((result) => {
        if (result.deletedCount) {
          const details = "המטלה " + req.body.taskDetails.title + " נמחקה";
          createAuditLog("מטלה נמחקה", details, req.body.idToken);
          return getAllTasks();
        } else {
          res.json({ result: false, details: result });
        }
      })
      .then((tasks) => {
        res.json(tasks);
      });
  }
});

app.post("/api/tasks", authorization, (req, res) => {
  getAllTasks().then((tasks) => {
    res.json(tasks);
  });
});

app.post("/api/taskgroups", authorization, (req, res) => {
  getTaskGroups(req.userEmail).then((taskGroups) => {
    res.json(taskGroups);
  });
});

app.post("/api/taskgroup", authorization, (req, res) => {
  createTaskGroup(req.userEmail).then((result) => {
    if (result.insertedCount) {
      const details = "נוצרה קבוצת מטלות חדשה";
      const moreDetails = "מזהה: " + result.insertedId.toString();
      createAuditLog(
        "נוצרה קבוצת מטלות",
        details,
        req.body.idToken,
        moreDetails
      );

      getTaskGroups(req.userEmail).then((taskGroups) => {
        res.json(taskGroups);
      });
    } else {
      res.json([]);
    }
  });
});

app.put("/api/taskgroup", authorization, (req, res) => {
  updateTaskGroupTitle(req.body.groupTitle, req.body.groupID).then((result) => {
    if (result) {
      const details = "שם קבוצת המטלות שונה ל-" + req.body.groupTitle;
      const moreDetails = "מזהה: " + req.body.groupID;
      createAuditLog(
        "קבוצת מטלות עודכנה",
        details,
        req.body.idToken,
        moreDetails
      );

      getTaskGroups(req.userEmail).then((taskGroups) => {
        res.json(taskGroups);
      });
    } else {
      res.json([]);
    }
  });
});

app.delete("/api/taskgroup", authorization, (req, res) => {
  if (!req.body.groupID) {
    res.json({ result: false, details: "missing groupID parameter" });
  } else {
    deleteTasksGroup(req.body.groupID)
      .then((result) => {
        if (result.deletedCount) {
          const details = "קבוצת המטלות " + req.body.groupID + " נמחקה";
          createAuditLog("קבוצת מטלות עודכנה", details, req.body.idToken);
          return getTaskGroups(req.userEmail);
        } else {
          res.json({ result: false, details: result });
        }
      })
      .then((tasks) => {
        res.json(tasks);
      });
  }
});

app.get("/api/google-code", (req, res) => {
  res.send(req.query.code);
  // change?
});

app.post("/api/calendar-events", authorization, (req, res) => {
  let events = [];
  let calendar = "";
  if (
    !req.body.mainCalendar &&
    !req.body.secondCalendar &&
    !req.body.thirdCalendar
  ) {
    return res.json([]);
  }
  if (req.body.mainCalendar) {
    calendar = "main";
  } else if (req.body.secondCalendar) {
    calendar = "second";
  } else if (req.body.thirdCalendar) {
    calendar = "third";
  }
  calendarApi
    .getEvents(req.body.start, req.body.end, calendar)
    .then((eventsResponse) => {
      eventsResponse.map((event) => {
        events.push({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          description: event.description || "",
          calendarName: calendar,
          patientId: event.extendedProperties
            ? event.extendedProperties.private.patientId
            : "",
        });
      });
      res.json(events);
    });
});

app.post("/api/event", authorization, (req, res) => {
  if (
    !req.body.event ||
    !req.body.event.start ||
    !req.body.event.end ||
    !req.body.event.summary ||
    !req.body.calendarName
  ) {
    res.json({ res: "error - missing fields" });
  }
  calendarApi
    .createEvent(req.body.event, req.body.calendarName)
    .then((response) => {
      if (response.data && response.data.id) {
        res.json({ res: "OK - event created" });

        let date;
        try {
          date = req.body.event.start.dateTime
            ? new Date(req.body.event.start.dateTime).valueOf()
            : new Date(req.body.event.start.date).valueOf();
        } catch {
          date = "2524654861000";
        }
        if (req.body.event.extendedProperties.private.patientId) {
          newPatientEvent({
            title: req.body.event.summary,
            description: req.body.event.description,
            date: date,
            patientId: req.body.event.extendedProperties.private.patientId,
            eventId: response.data.id,
            userName: req.body.userName,
            template: "פגישה",
          });
        }

        const details = "כותרת: " + req.body.event.summary;
        let moreDetails = req.body.event.description
          ? "תיאור: " + req.body.event.description + "\n"
          : "";
        moreDetails += "התחלה: " + JSON.stringify(req.body.event.start) + "\n";
        moreDetails += "סיום: " + JSON.stringify(req.body.event.end) + "\n";
        moreDetails += req.body.event.extendedProperties.private.patientId
          ? "מזהה לקוח: " +
            req.body.event.extendedProperties.private.patientId +
            "\n"
          : "";
        moreDetails += "מזהה אירוע: " + response.data.id + "\n";
        moreDetails += "מזהה יומן: " + req.body.calendarName;
        createAuditLog(
          "אירוע יומן חדש",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        console.log(response);
        res.json({ res: "error - event creation failed" });
      }
    });
});

app.patch("/api/event", authorization, (req, res) => {
  if (
    !req.body.event ||
    !req.body.event.start ||
    !req.body.event.end ||
    !req.body.event.summary ||
    !req.body.event.id ||
    !req.body.calendarName
  ) {
    res.json({ res: "error - missing fields" });
  }
  calendarApi
    .updateEvent(req.body.event, req.body.calendarName)
    .then((response) => {
      if (response.data && response.data.id) {
        res.json({ res: "OK - event updated" });

        let date;
        try {
          date = req.body.event.start.dateTime
            ? new Date(req.body.event.start.dateTime).valueOf()
            : new Date(req.body.event.start.date).valueOf();
        } catch {
          date = "2524654861000";
        }
        if (req.body.event.extendedProperties.private.patientId) {
          updatePatientEvent({
            title: req.body.event.summary,
            description: req.body.event.description,
            date: date,
            patientId: req.body.event.extendedProperties.private.patientId,
            eventId: response.data.id,
            userName: req.body.userName,
            template: "פגישה",
          });
        }

        const details = "כותרת: " + req.body.event.summary;
        let moreDetails = req.body.event.description
          ? "תיאור: " + req.body.event.description + "\n"
          : "";
        moreDetails += "התחלה: " + JSON.stringify(req.body.event.start) + "\n";
        moreDetails += "סיום: " + JSON.stringify(req.body.event.end) + "\n";
        moreDetails += req.body.event.extendedProperties.private.patientId
          ? "מזהה לקוח: " +
            req.body.event.extendedProperties.private.patientId +
            "\n"
          : "";
        moreDetails += "מזהה אירוע: " + response.data.id + "\n";
        moreDetails += "מזהה יומן: " + req.body.calendarName;
        createAuditLog(
          "אירוע יומן עודכן",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        console.log(response);
        res.json({ res: "error - event update failed" });
      }
    });
});

app.delete("/api/event", authorization, (req, res) => {
  if (!req.body.eventId) {
    res.json({ res: "error - missing fields" });
  }
  calendarApi
    .deleteEvent(req.body.eventId, req.body.calendarName)
    .then((response) => {
      if (response.data === "") {
        res.json({ res: response });

        const details = "האירוע " + req.body.eventId + " נמחק מהיומן";
        createAuditLog("אירוע יומן נמחק", details, req.body.idToken);

        db.collection("patientEvents")
          .findOne({ eventId: req.body.eventId })
          .then((event) => (event ? deletePatientEvent(event._id) : ""))
          .catch((error) => console.log(error));
      } else {
        console.log(response);
        res.json({ res: "error - event deletion failed" });
      }
    });
});

app.post("/api/patient-files", authorization, (req, res) => {
  if (!req.body.id && !req.body.passport) {
    return res.json([]);
  }

  getPatientFiles(req.body.id || req.body.passport)
    .then((files) => {
      res.json(files);
    })
    .catch((error) => {
      console.log(error);
      res.json([]);
    });
});

app.post("/api/patient-file", authorization, (req, res) => {
  getFileLink(req.body.filePath)
    .then((link) => {
      // console.log(files);
      res.json({ link: link });
    })
    .catch((error) => {
      console.log(error);
      res.json(null);
    });
});

app.post("/api/patient-photos", authorization, (req, res) => {
  if (!req.body.id && !req.body.passport) {
    return res.json([]);
  }
  getPatientFiles(req.body.id || req.body.passport, true)
    .then((files) => {
      res.json(files);
    })
    .catch((error) => {
      console.log(error);
      res.json([]);
    });
});

app.post("/api/patient", authorization, (req, res) => {
  createPatient(req.body.patient).then((newPatientId) => {
    if (newPatientId) {
      createPatientDPFolder(req.body.patient);
      newPatientEvent({
        title: "הלקוח התווסף למערכת",
        description: "",
        date: Date.now(),
        patientId: newPatientId,
        userName: req.body.userName,
      });
      const details =
        "הלקוח " +
        (req.body.patient.firstName + " " + req.body.patient.lastName) +
        " התווסף למערכת";
      let moreDetails = req.body.patient.email
        ? " כתובת מייל: " + req.body.patient.email + "\n"
        : "";
      moreDetails += req.body.patient.city
        ? " עיר: " + req.body.patient.city + "\n"
        : "";
      moreDetails += req.body.patient.address
        ? " כתובת מגורים: " + req.body.patient.address + "\n"
        : "";
      moreDetails += req.body.patient.phone
        ? " טלפון: " + req.body.patient.phone + "\n"
        : "";
      moreDetails += req.body.patient.secondPhone
        ? "טלפון שני: " + req.body.patient.secondPhone + "\n"
        : "";
      moreDetails += req.body.patient.birthDate
        ? " תאריך לידה: " +
          new Date(req.body.patient.birthDate).toLocaleDateString("he") +
          "\n"
        : "";
      moreDetails += req.body.patient.id
        ? " תעודת זהות: " + req.body.patient.id + "\n"
        : "";
      moreDetails += req.body.patient.passport
        ? " מספר דרכון: " + req.body.patient.passport + "\n"
        : "";
      moreDetails += req.body.patient.comment
        ? " הערות: " + req.body.patient.comment + "\n"
        : "";
      moreDetails += req.body.patient.category
        ? " שיוך: " + req.body.patient.category.join(", ") + "\n"
        : "";
      moreDetails += req.body.patient.procedures
        ? " פעולות: " + req.body.patient.procedures.join(", ") + "\n"
        : "";
      moreDetails +=
        " מין: " + (req.body.patient.gender === "male" ? "זכר" : "נקבה") + "\n";
      moreDetails += req.body.patient.bool1
        ? " שדה1: " + req.body.patient.bool1 + "\n"
        : "";
      moreDetails += req.body.patient.bool2
        ? " שדה2: " + req.body.patient.bool2 + "\n"
        : "";
      moreDetails += req.body.patient.bool3
        ? " שדה3: " + req.body.patient.bool3 + "\n"
        : "";
      moreDetails += " מזהה לקוח: " + newPatientId;
      createAuditLog(
        "לקוח התווסף למערכת",
        details,
        req.body.idToken,
        moreDetails
      );
      res.json({ result: true });
    } else {
      res.json({ result: false });
    }
  });
});

app.put("/api/patient", authorization, (req, res) => {
  const patientObjectId = req.body.patient._id;
  updatePatient(req.body.patient).then((result) => {
    res.json({ result: result });
    if (result) {
      const details =
        "פרטי הלקוח " +
        (req.body.patient.firstName + " " + req.body.patient.lastName) +
        " עודכנו";
      let moreDetails = req.body.patient.email
        ? " כתובת מייל: " + req.body.patient.email + "\n"
        : "";
      moreDetails += req.body.patient.city
        ? " עיר: " + req.body.patient.city + "\n"
        : "";
      moreDetails += req.body.patient.address
        ? " כתובת מגורים: " + req.body.patient.address + "\n"
        : "";
      moreDetails += req.body.patient.phone
        ? " טלפון: " + req.body.patient.phone + "\n"
        : "";
      moreDetails += req.body.patient.secondPhone
        ? "טלפון שני: " + req.body.patient.secondPhone + "\n"
        : "";
      moreDetails += req.body.patient.birthDate
        ? " תאריך לידה: " +
          new Date(req.body.patient.birthDate).toLocaleDateString("he") +
          "\n"
        : "";
      moreDetails += req.body.patient.id
        ? " תעודת זהות: " + req.body.patient.id + "\n"
        : "";
      moreDetails += req.body.patient.passport
        ? " מספר דרכון: " + req.body.patient.passport + "\n"
        : "";
      moreDetails += req.body.patient.comment
        ? " הערות: " + req.body.patient.comment + "\n"
        : "";
      moreDetails += req.body.patient.category
        ? " שיוך: " + req.body.patient.category.join(", ") + "\n"
        : "";
      moreDetails += req.body.patient.procedures
        ? " פעולות: " + req.body.patient.procedures.join(", ") + "\n"
        : "";
      moreDetails +=
        " מין: " + (req.body.patient.gender === "male" ? "זכר" : "נקבה") + "\n";
      moreDetails += req.body.patient.bool1
        ? " שדה1: " + req.body.patient.bool1 + "\n"
        : "";
      moreDetails += req.body.patient.bool2
        ? " שדה2: " + req.body.patient.bool2 + "\n"
        : "";
      moreDetails += req.body.patient.bool3
        ? " שדה3: " + req.body.patient.bool3 + "\n"
        : "";
      moreDetails += " מזהה לקוח: " + patientObjectId;
      createAuditLog(
        "פרטי לקוח עודכנו",
        details,
        req.body.idToken,
        moreDetails
      );
    }
  });
});

app.delete("/api/patient", authorization, (req, res) => {
  deletePatient(req.body.patientId, req.body.idToken).then((patients) => {
    res.json(patients);
  });
});

app.post("/api/document", authorization, async (req, res) => {
  const templateContent = await getTemplateFile(req.body.templatePath);
  if (!templateContent) {
    res.json({ success: false });
    return;
  }

  createDocFromTemplate(
    req.body.templateFields,
    req.body.templatePath.split("/").pop(),
    templateContent,
    req.body.patient
  )
    .then((sharedLink) => {
      if (sharedLink) {
        res.json({ success: true, link: sharedLink });
        const details =
          "נוצר מסמך לקוח עבור " +
          req.body.patient.firstName +
          " " +
          req.body.patient.lastName;
        let moreDetails = req.body.patient.id
          ? "תעוזת זהות: " + req.body.patient.id + "\n"
          : "";
        moreDetails += "מזהה לקוח: " + req.body.patient._id + "\n";
        moreDetails += "שם המסמך: " + req.body.templatePath.split("/").pop();
        createAuditLog(
          "נוצר מסמך לקוח",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        res.json({ success: false });
      }
    })
    .catch((error) => {
      res.json({ error: error });
    });
});

app.post("/api/users", authorization, (req, res) => {
  listAllUsers().then((users) => {
    res.json({ users: users });
  });
});

app.delete("/api/user", authorization, (req, res) => {
  deleteUser(req.body.userId).then((users) => {
    res.json(users);

    let details = " המשתמש " + req.body.userName + " נמחק מהמערכת";
    let moreDetails = " מזהה משתמש: " + req.body.userId;
    createAuditLog(
      "משתמש נמחק מהמערכת",
      details,
      req.body.idToken,
      moreDetails
    );
  });
});

app.patch("/api/user", authorization, (req, res) => {
  if (req.body.updatedFields.role) {
    changeUserRole(req.body.uid, req.body.updatedFields).then((result) => {
      if (result) {
        res.json({ result: true });

        const details = " פרטי המשתמש " + req.body.user.name + " עודכנו ";
        let moreDetails = "תפקיד: " + req.body.updatedFields.role + "\n";
        moreDetails += "מזהה משתמש: " + req.body.uid;
        createAuditLog(
          "פרטי משתמש עודכנו",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        res.json({ result: false });
      }
    });
  } else {
    updateUser(req.body.uid, req.body.updatedFields).then((result) => {
      if (result) {
        res.json({ result: true });

        const details = " פרטי המשתמש " + req.body.user.name + " עודכנו ";
        let moreDetails = "";
        if (req.body.updatedFields.phoneNumber) {
          moreDetails =
            "מספר טלפון: " + req.body.updatedFields.phoneNumber + "\n";
        } else if (req.body.updatedFields.displayName) {
          moreDetails = "שם: " + req.body.updatedFields.displayName + "\n";
        } else if (req.body.updatedFields.email) {
          moreDetails = "כתובת אמייל: " + req.body.updatedFields.email + "\n";
        } else if (req.body.updatedFields.multiFactor) {
          if (req.body.updatedFields.multiFactor.enrolledFactors) {
            moreDetails = "אימות דו שלבי: פעיל" + "\n";
          } else {
            moreDetails = "אימות דו שלבי: כבוי" + "\n";
          }
        }
        moreDetails += "מזהה משתמש: " + req.body.uid;
        createAuditLog(
          "פרטי משתמש עודכנו",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        res.json({ result: false });
      }
    });
  }
});

app.post("/api/roles", authorization, (req, res) => {
  getRoles().then((roles) => {
    res.json(roles);
  });
});

app.post("/api/role", authorization, (req, res) => {
  newRole(req.body.roleName).then(() => {
    res.json({ result: "OK" });

    const details = " נוצר תפקיד מערכת חדש ";
    createAuditLog("תפקיד מערכת חדש", details, req.body.idToken);
  });
});

app.patch("/api/role", authorization, async (req, res) => {
  const roleName = await db
    .collection("roles")
    .findOne({ _id: ObjectId(req.body.roleId) })
    .then((role) => role.name)
    .catch((err) => "");

  updateRole(req.body.roleId, req.body.permission)
    .then((res) => {
      return getRoles();
    })
    .then((roles) => {
      res.json(roles);

      const details = " פרטי התפקיד " + roleName + " עודכנו ";
      let moreDetails = "שינוי: " + JSON.stringify(req.body.permission) + "\n";
      moreDetails += "מזהה תפקיד: " + req.body.roleId;
      createAuditLog(
        "תפקיד מערכת עודכן",
        details,
        req.body.idToken,
        moreDetails
      );
    })
    .catch(() => {
      res.json([]);
    });
});

app.delete("/api/role", authorization, async (req, res) => {
  const roleName = await db
    .collection("roles")
    .findOne({ _id: ObjectId(req.body.roleId) })
    .then((role) => role.name)
    .catch((err) => "");

  deleteRole(req.body.roleId).then(() => {
    res.json({ success: true });

    const details = "התפקיד " + roleName + " נמחק";
    let moreDetails = "מזהה תפקיד: " + req.body.roleId;
    createAuditLog("תפקיד מערכת נמחק", details, req.body.idToken, moreDetails);
  });
});

app.post("/api/role-permissions", authorization, (req, res) => {
  getPermissions(req.body.idToken).then((permissionsList) => {
    res.json(permissionsList);
  });
});

app.post("/api/timeline", authorization, (req, res) => {
  getPatientEvents(req.body.patientId)
    .then((events) => {
      let timeline = [];
      const timelineObject = groupBy(events, (event) => {
        const date = new Date(event.date);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      });
      for (const day in timelineObject) {
        const dayObject = {};
        dayObject[day] = timelineObject[day];
        timeline.push(dayObject);
      }
      res.json(timeline);
    })
    .catch((error) => {
      console.log(error);
      res.json({});
    });
});

app.post("/api/patient-event", authorization, async (req, res) => {
  const patientName = await db
    .collection("patients")
    .findOne({ _id: ObjectId(req.body.event.patientId) })
    .then((patient) => patient.firstName + " " + patient.lastName)
    .catch((err) => "");

  newPatientEvent(req.body.event)
    .then(async (response) => {
      if (req.body.event.template === "פעולה") {
        await db
          .collection("patients")
          .updateOne(
            { _id: ObjectId(req.body.event.patientId) },
            { $addToSet: { procedures: req.body.event.title } }
          )
          .catch((err) => console.log(err));
      }

      res.json({ result: "OK" });

      const details = " אירוע חדש נוצר עבור " + patientName;
      let moreDetails = "כותרת: " + req.body.event.title + "\n";
      moreDetails += req.body.event.description
        ? "תיאור: " + req.body.event.description + "\n"
        : "";
      moreDetails += "סוג אירוע: " + req.body.event.template + "\n";
      moreDetails += "מזהה אירוע: " + response.insertedId + "\n";
      moreDetails += "מזהה לקוח: " + req.body.event.patientId;
      createAuditLog(
        "פעילות לקוח חדשה",
        details,
        req.body.idToken,
        moreDetails
      );
    })
    .catch((error) => {
      console.log(error);
      res.json({ error: true });
    });
});

app.delete("/api/patient-event", authorization, async (req, res) => {
  const event = await db
    .collection("patientEvents")
    .findOne({ _id: ObjectId(req.body.eventId) })
    .then((event) => event)
    .catch((err) => "");

  const patientName = await db
    .collection("patients")
    .findOne({ _id: ObjectId(event.patientId) })
    .then((patient) => patient.firstName + " " + patient.lastName)
    .catch((err) => "");

  deletePatientEvent(req.body.eventId)
    .then(async (result) => {
      if (result.deletedCount) {
        res.json({ result: "OK" });

        if (event.template === "פעולה") {
          await db
            .collection("patientEvents")
            .findOne({
              patientId: event.patientId,
              template: "פעולה",
              title: event.title,
            })
            .then((res) => {
              if (!res) {
                db.collection("patients")
                  .updateOne(
                    { _id: ObjectId(event.patientId) },
                    { $pull: { procedures: event.title } }
                  )
                  .catch((err) => console.log(err));
              }
            })
            .catch((err) => {
              console.log("error!", err);
            });
        }

        const details = " אירוע נמחק עבור " + patientName;
        let moreDetails = "כותרת: " + event.title + "\n";
        moreDetails += "מזהה אירוע: " + event._id.toString() + "\n";
        moreDetails += "מזהה לקוח: " + event.patientId;
        createAuditLog(
          "פעילות לקוח נמחקה",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        res.json({ result: false });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ error: true });
    });
});

app.patch("/api/patient-event", authorization, async (req, res) => {
  const eventId = req.body.event._id;

  const patientName = await db
    .collection("patients")
    .findOne({ _id: ObjectId(req.body.event.patientId) })
    .then((patient) => patient.firstName + " " + patient.lastName)
    .catch((err) => "");

  const previousEvent = await db
    .collection("patientEvents")
    .findOne({ _id: ObjectId(eventId) })
    .catch((err) => null);

  updatePatientEvent(req.body.event)
    .then(async (result) => {
      if (result) {
        res.json({ result: "OK" });

        if (
          previousEvent &&
          previousEvent.template === "פעולה" &&
          (previousEvent.title != req.body.event.title ||
            req.body.event.template !== "פעולה")
        ) {
          await db
            .collection("patientEvents")
            .findOne({
              patientId: previousEvent.patientId,
              template: "פעולה",
              title: previousEvent.title,
            })
            .then((res) => {
              if (!res) {
                db.collection("patients")
                  .updateOne(
                    { _id: ObjectId(previousEvent.patientId) },
                    { $pull: { procedures: previousEvent.title } }
                  )
                  .catch((err) => console.log(err));
              }
            })
            .catch((err) => {
              console.log("error!", err);
            });
        }

        if (req.body.event.template === "פעולה") {
          await db
            .collection("patients")
            .updateOne(
              { _id: ObjectId(req.body.event.patientId) },
              { $addToSet: { procedures: req.body.event.title } }
            )
            .catch((err) => console.log(err));
        }

        const details = " עודכנו פרטי אירוע עבור " + patientName;
        let moreDetails = "כותרת: " + req.body.event.title + "\n";
        moreDetails += req.body.event.description
          ? "תיאור: " + req.body.event.description + "\n"
          : "";
        moreDetails += "סוג אירוע: " + req.body.event.template + "\n";
        moreDetails += "מזהה אירוע: " + eventId + "\n";
        moreDetails += "מזהה לקוח: " + req.body.event.patientId;
        createAuditLog(
          "פרטי פעילוח לקוח עודכנו",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        res.json({ result: false });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ error: true });
    });
});

app.post("/api/user-photo", authorization, (req, res) => {
  createUserPhoto(req.body.userId, req.body.photo)
    .then((response) => {
      if (response.upsertedCount || response.modifiedCount) {
        res.json({ result: true });

        const details = " תמונת הפרופיל של " + req.body.userName + " עודכנה ";
        const moreDetails = "מזהה משתמש: " + req.body.userId;
        createAuditLog(
          "עדכון תמונת פרופיל",
          details,
          req.body.idToken,
          moreDetails
        );
      } else {
        res.json({ result: false });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ result: false });
    });
});

app.patch("/api/closed-tasks", authorization, (req, res) => {
  cleanClosedTasks()
    .then((result) => {
      if (result) {
        getAllTasks().then((tasks) => {
          res.json(tasks);

          const details = "המטלות הסגורות אופסו";
          createAuditLog("איפוס מטלות סגורות", details, req.body.idToken);
        });
      } else {
        res.json([]);
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ error: true });
    });
});

app.post("/api/open-items", authorization, (req, res) => {
  getUserOpenItems(req.body.userId)
    .then((response) => {
      res.json(response);
    })
    .catch((error) => {
      res.json({ result: false });
    });
});

app.post("/api/patients-photos", authorization, (req, res) => {
  getPatientsList(null, req.body.patientIds)
    .then((patients) => {
      const patientPhotos = {};
      patients.forEach((patient) => {
        if (req.body.patientIds.includes(patient._id.toString())) {
          patientPhotos[patient._id] = patient.picture;
        }
      });
      res.json(patientPhotos);
    })
    .catch((error) => {
      console.log(error);
      res.json({ result: false });
    });
});

app.post("/api/patient-categories", authorization, (req, res) => {
  getPatientCategories().then((categories) => {
    const categoryNames = categories.map((category) => {
      return category.name;
    });
    res.json(categoryNames);
  });
});

app.patch("/api/patient-category", authorization, (req, res) => {
  if (!req.body.category) {
    res.json([]);
  } else if (req.body.action == "delete") {
    deletePatientCategory(req.body.category).then((categories) => {
      const categoryNames = categories.map((category) => {
        return category.name;
      });
      res.json(categoryNames);
      const details = "נמחק שיוך: " + req.body.category;
      createAuditLog("נמחק שיוך", details, req.body.idToken);
    });
  } else {
    addPatientCategory(req.body.category).then((categories) => {
      const categoryNames = categories.map((category) => {
        return category.name;
      });
      res.json(categoryNames);
      const details = "נוסף שיוך: " + req.body.category;
      createAuditLog("נוסף שיוך", details, req.body.idToken);
    });
  }
});

app.post("/api/export-patients", authorization, (req, res) => {
  getPatientsCSV().then((csv) => {
    res.send(csv);
  });
});

app.post("/api/export-audit", authorization, (req, res) => {
  getAuditEventsCSV().then((csv) => {
    res.send(csv);
  });
});

app.post("/api/export-users", authorization, (req, res) => {
  getUsersCSV().then((csv) => {
    res.send(csv);
  });
});

app.post("/api/procedures", authorization, (req, res) => {
  getProcedures().then((procedures) => {
    const procedureNames = procedures.map((procedure) => {
      return procedure.name;
    });
    res.json(procedureNames);
  });
});

app.patch("/api/procedure", authorization, (req, res) => {
  if (!req.body.procedure) {
    res.json([]);
  } else if (req.body.action == "delete") {
    deleteProcedure(req.body.procedure).then((procedures) => {
      const procedureNames = procedures.map((procedure) => {
        return procedure.name;
      });
      res.json(procedureNames);
      const details = "נמחקה פעולה: " + req.body.procedure;
      createAuditLog("נמחקה פעולה", details, req.body.idToken);
    });
  } else {
    addProcedure(req.body.procedure).then((procedures) => {
      const procedureNames = procedures.map((procedure) => {
        return procedure.name;
      });
      res.json(procedureNames);
      const details = "נוספה פעולה: " + req.body.procedure;
      createAuditLog("נוספה פעולה", details, req.body.idToken);
    });
  }
});

app.post("/api/templates", authorization, async (req, res) => {
  const allTemplatesAccess = await db
    .collection("roles")
    .findOne({ name: req.userRole })
    .then((role) => {
      if (role.createImportantDocs) {
        console.log("user has high templates permissions");
        return true;
      }
      console.log("user does NOT have high templates permissions");
      return false;
    });

  getTemplateNames(allTemplatesAccess).then((templateNames) => {
    res.json(templateNames);
  });
});

app.post("/api/doc-fields", authorization, async (req, res) => {
  getCustomDocFields().then((fields) => {
    res.json(fields);
  });
});

app.patch("/api/doc-fields", authorization, async (req, res) => {
  await updateCustomDocFields(req.body.fields);
  getCustomDocFields().then((fields) => {
    res.json(fields);
  });
});
