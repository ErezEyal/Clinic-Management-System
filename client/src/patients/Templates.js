import { useCallback, useEffect, useState } from "react";
import TemplateForm from "./TemplateForm";

function Templates(props) {
  const [template, setTemplate] = useState("");
  const [sharedLink, setSharedLink] = useState("");
  const DOCUMENT_URL = process.env.REACT_APP_BASE_API_URL + "document";

  useEffect(() => {
    if (!template && props.templates) {
      setTemplate(props.templates[0]);
    }
  }, [props]);

  const createDoc = useCallback(
    async (fields) => {
      const data = {
        templateFields: fields,
        patient: props.patient,
        templatePath: template,
      };
      let success = false;
      await props.user
        .getIdToken(true)
        .then(async (idToken) => {
          await props
            .postRequestWithToken(DOCUMENT_URL, idToken, data)
            .then((result) => {
              if (result.success) {
                console.log(result);
                setSharedLink(result.link);
                success = true;
              } else {
                success = false;
                setSharedLink("");
              }
            })
            .catch((error) => {
              console.log(error);
              success = false;
              setSharedLink("");
            });
        })
        .catch((error) => {
          console.log(error);
          success = false;
          setSharedLink("");
        });
      //   setTimeout(() => {
      //     if (success) props.docCreated();
      //   }, 1800);
      return success;
    },
    [DOCUMENT_URL, props, template]
  );

  return (
    <div className="overflow-auto smallScrollBar">
      <select
        className="form-control d-inline normalInputSize mr-2"
        onChange={(e) => setTemplate(e.target.value)}
      >
        {props.templates &&
          props.templates.map((templatePath) => {
            return (
              <option value={templatePath}>
                {templatePath.split("/").pop()}
              </option>
            );
          })}
      </select>
      <TemplateForm
        createDoc={createDoc}
        patient={props.patient}
        sharedLink={sharedLink || "#"}
        postRequestWithToken={props.postRequestWithToken}
        patchRequestWithToken={props.patchRequestWithToken}
        user={props.user}
      />
    </div>
  );
}

export default Templates;
