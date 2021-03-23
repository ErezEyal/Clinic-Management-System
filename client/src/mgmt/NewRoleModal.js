import { useRef } from "react";
import { Button, Modal } from "react-bootstrap";

function NewRoleModal(props) {
  const roleNameRef = useRef();

  const handleSave = () => {
    if (roleNameRef.current.value.length) {
      props.save(roleNameRef.current.value);
      props.hide();
    }
  };
  return (
    <>
      <Modal className="rtl" show={props.show} onHide={props.hide}>
        <Modal.Header>
          <Modal.Title>תפקיד חדש</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-right">
          <div className="">
            <div className="pt-3 pb-2 pr-1">
              <label className="ml-3">שם התפקיד</label>
              <div className="d-inline-block">
                <input ref={roleNameRef} className="form-control" />
              </div>
            </div>
          </div>
        </Modal.Body>
        <div>
          <hr />
        </div>
        <div className="text-right pb-3 px-2 pt-1">
          <Button variant="primary" className="mr-2" onClick={handleSave}>
            צור תפקיד
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

export default NewRoleModal;
