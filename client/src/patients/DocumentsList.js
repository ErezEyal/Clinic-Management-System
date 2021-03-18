import { useEffect, useRef, useState } from "react";
import DropBoxPreview from "./LoadDropBox";
import Loading from "../Loading";
import { FormControl } from "react-bootstrap";

function DocumentsList(props) {
  const dropBoxDivRef = useRef();
  const [preview, setPreview] = useState(null);
  const [loadedFile, setLoadedFile] = useState(null);
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif"];
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const dropboxPreview = new DropBoxPreview(dropBoxDivRef.current);
    setPreview(dropboxPreview);
  }, [dropBoxDivRef, props]);

  useEffect(() => {
    return () => {
      if (preview) {
        preview.unload();
      }
    };
  });

  useEffect(() => {
    if (loadedFile) {
      preview.loadPhoto(loadedFile);
    }
  }, [loadedFile]);

  const fetchAndLoadLink = async (filePath) => {
    const link = await props.getLink(filePath);
    setLoadedFile(link);
    // setTimeout(() => {
    //     showPhoto(link);
    // },100)
  };

  const filesList = props.files
    ? props.files.flatMap((file, index) => {
        const fileName = file.path.substring(file.path.lastIndexOf("/") + 1);
        // console.log(fileName)
        if (!file.path.includes(filter)) {
          return [];
        }

        return [
          <li className="py-2 coloredList patientNav" key={index}>
            <a
              href={file.link}
              target="_blank"
              className={
                "text-decoration-none" + (file.link ? "" : " text-dark")
              }
              title={file.path.substring(1)}
            >
              <span>
                {fileName.length && fileName.length > 50
                  ? fileName.substring(0, 50) + "..."
                  : fileName}
              </span>
            </a>
            {file.link ? (
              <span
                className="mr-2 fontSmall text-secondary pointer d-none d-lg-inline"
                onClick={() => showPhoto(file.link)}
              >
                הצג
              </span>
            ) : (
              <span
                className="mr-2 fontSmall text-secondary pointer"
                onClick={() => fetchAndLoadLink(file.path)}
              >
                טען
              </span>
            )}
          </li>,
        ];
      })
    : [];

  const showPhoto = (url) => {
    preview.loadPhoto(url);
  };

  const searchIcon = (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      className="bi bi-search"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"
      />
      <path
        fillRule="evenodd"
        d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
      />
    </svg>
  );

  return (
    <>
      {!props.files ? (
        <Loading />
      ) : (
        <>
          <div className="d-flex flex-fill">
            <div className="col-lg-4">
              <div
                className="border-bottom d-inline-block rounded my-1"
                style={{ abackgroundColor: "#f5f8fa" }}
              >
                <FormControl
                  placeholder={`חיפוש מתוך ${filesList.length} קבצים`}
                  style={{ width: "13rem" }}
                  className="d-inline-block border-0 shadow-none bg-transparent"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <div
                  className="d-inline-block px-3"
                  style={{ color: "#007A8C" }}
                >
                  {searchIcon}
                </div>
              </div>
              <ul
                className="px-0 list-unstyled overflow-auto"
                style={{ maxHeight: "75vh" }}
              >
                {filesList}
              </ul>
            </div>

            <div
              ref={dropBoxDivRef}
              className="flex-fill d-none d-lg-block col-lg-8 border-right pr-5 abc"
            ></div>
          </div>
        </>
      )}
    </>
  );
}

export default DocumentsList;
