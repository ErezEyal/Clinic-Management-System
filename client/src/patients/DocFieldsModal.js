import { useRef } from "react";
import { Button, Modal } from "react-bootstrap";

function DocFieldsModal(props) {
  const fieldARef = useRef();
  const fieldBRef = useRef();
  const fieldCRef = useRef();
  const fieldDRef = useRef();
  const handleSave = () => {
    const newFields = {
      fieldA: fieldARef.current.value,
      fieldB: fieldBRef.current.value,
      fieldC: fieldCRef.current.value,
      fieldD: fieldDRef.current.value,
    };
    props.save(newFields);
    props.hide();
  };
  return (
    <>
      <Modal className="rtl" show={props.show} onHide={props.hide}>
        <Modal.Header>
          <Modal.Title>שדות נוספים</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-right">
          <div className="">
            <div className="p-3">
              <label className="ml-3">fieldA</label>
              <div className="d-inline-block">
                <input
                  ref={fieldARef}
                  className="form-control"
                  defaultValue={props.customFields[0]}
                />
              </div>
            </div>
            <div className="p-3">
              <label className="d-md-inline-block ml-3">fieldB</label>
              <div className="d-inline-block">
                <input
                  ref={fieldBRef}
                  className="form-control"
                  defaultValue={props.customFields[1]}
                />
              </div>
            </div>
            <div className="p-3">
              <label className="d-md-inline-block ml-3">fieldC</label>
              <div className="d-inline-block">
                <input
                  ref={fieldCRef}
                  className="form-control"
                  defaultValue={props.customFields[2]}
                />
              </div>
            </div>
            <div className="p-3">
              <label className="d-md-inline-block ml-3">fieldD</label>
              <div className="d-inline-block">
                <input
                  ref={fieldDRef}
                  className="form-control"
                  defaultValue={props.customFields[3]}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <div>
          <hr />
        </div>
        <div className="text-right pb-3 px-2 pt-1">
          <Button variant="primary" className="mr-2" onClick={handleSave}>
            עדכן שדות
          </Button>
          <Button
            variant="outline-secondary"
            className="float-left ml-2"
            onClick={props.hide}
          >
            סגור
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default DocFieldsModal;
